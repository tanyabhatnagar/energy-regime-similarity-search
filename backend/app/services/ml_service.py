import os
import pickle
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from hmmlearn import hmm
from app.models.data_models import Windows, Regimes, SimilarityResults
from app.core.config import settings

def train_hmm_model(db: Session, n_components: int = 4):
    query = select(Windows).order_by(Windows.start_time)
    windows = db.execute(query).scalars().all()
    
    if not windows:
        raise ValueError("No windowed data found for training.")

    # Prepare data for HMM
    # Hmmlearn expects a sequence of observations and an array of lengths
    X = []
    lengths = []
    
    for window in windows:
        data = np.array(window.data) # shape: (window_size, n_features)
        X.append(data)
        lengths.append(len(data))

    split_idx = int(len(X) * 0.8)
    if split_idx == 0 or split_idx == len(X):
        X_train = X
        lengths_train = lengths
        X_val = X
        lengths_val = lengths
    else:
        X_train = X[:split_idx]
        lengths_train = lengths[:split_idx]
        X_val = X[split_idx:]
        lengths_val = lengths[split_idx:]
        
    X_train_concat = np.concatenate(X_train)
    X_val_concat = np.concatenate(X_val)

    
    model = hmm.GaussianHMM(n_components=n_components, covariance_type="full", n_iter=100)
    model.fit(X_train_concat, lengths_train)
    
    try:
        train_score = model.score(X_train_concat, lengths_train)
        val_score = model.score(X_val_concat, lengths_val)
    except Exception:
        train_score = 0.0
        val_score = 0.0
    
    # Save model
    os.makedirs(settings.MODEL_SAVE_DIR, exist_ok=True)
    model_path = os.path.join(settings.MODEL_SAVE_DIR, 'hmm_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    # Predict regimes for each window and store
    db.execute(delete(Regimes))
    db.commit()
    
    regime_records = []
    for window in windows:
        data = np.array(window.data)
        # Sequence of states, we can take the most frequent or the last state as the regime for the window
        states = model.predict(data)
        majority_state = int(np.bincount(states).argmax())
        
        regime_records.append(
            Regimes(
                window_id=window.id,
                regime_label=majority_state
            )
        )
        
    chunk_size = 5000
    for i in range(0, len(regime_records), chunk_size):
        db.add_all(regime_records[i:i+chunk_size])
        db.commit()
    
    return train_score, val_score

def load_model():
    model_path = os.path.join(settings.MODEL_SAVE_DIR, 'hmm_model.pkl')
    if not os.path.exists(model_path):
        raise ValueError("Model not found. Train the model first using /model/train.")
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    return model

def get_transition_matrix():
    model = load_model()
    return model.transmat_.tolist()

_similarity_cache = {}

def similarity_search(db: Session, start_time: str, end_time: str, top_k: int = 5):
    # Check cache first
    cache_key = f"{start_time}_{end_time}_{top_k}"
    if cache_key in _similarity_cache:
        return _similarity_cache[cache_key]

    from datetime import datetime
    st_dt = datetime.fromisoformat(str(start_time).replace('Z', ''))
    et_dt = datetime.fromisoformat(str(end_time).replace('Z', ''))
    
    diff_hours = int(max(1, (et_dt - st_dt).total_seconds() / 3600))
    if diff_hours > 24:
        diff_hours = 24
        
    query_window = db.execute(
        select(Windows).filter(Windows.start_time >= start_time).order_by(Windows.start_time).limit(1)
    ).scalars().first()
    
    if not query_window:
        query_window = db.execute(select(Windows).limit(1)).scalars().first()
        
    if not query_window:
        raise ValueError("No data windows are available in the database to query.")

    model = load_model()
    
    query_data = np.array(query_window.data)[:diff_hours]
    query_states = model.predict(query_data)
    
    all_windows = db.execute(select(Windows)).scalars().all()
    
    scores = []
    for w in all_windows:
        # Ignore exactly identically overlapping or adjacent subsets (prevent matching 1-hr displacements)
        if abs((w.start_time - query_window.start_time).total_seconds()) < (diff_hours // 2) * 3600:
            continue
            
        target_data = np.array(w.data)[:diff_hours]
        if len(target_data) < diff_hours:
            continue
            
        try:
            target_states = model.predict(target_data)
            state_diff = np.sum(query_states != target_states)
            mse = np.mean((query_data - target_data) ** 2)
            
            combined_distance = mse + (state_diff * 0.1)
            score = -combined_distance
            
            scores.append((w, score))
        except Exception:
            continue
            
    if not scores:
        raise ValueError("No similar windows could be scored due to missing baseline data.")

    scores.sort(key=lambda x: x[1], reverse=True)
    top_results = scores[:top_k]
    
    class MockWindow:
        def __init__(self, id, st, et, data):
            from datetime import timedelta
            self.id = id
            self.start_time = st
            self.end_time = st + timedelta(hours=diff_hours)
            self.data = data

    ret_query_window = MockWindow(
        query_window.id, 
        query_window.start_time, 
        None, 
        query_data.tolist()
    )
    
    results = []
    rank = 1
    for t_w, s in top_results:
        ret_t_w = MockWindow(
            t_w.id,
            t_w.start_time,
            None,
            np.array(t_w.data)[:diff_hours].tolist()
        )
        results.append({
            "target_window": ret_t_w,
            "log_likelihood_score": s,
            "rank": rank
        })
        rank += 1
        
    _similarity_cache[cache_key] = (ret_query_window, results)
    return ret_query_window, results
