# Energy Regime Similarity Search System – System Design Document

## Project Overview

The **Energy Regime Similarity Search System** is a machine learning based analytical platform designed to analyze electricity market time-series data and identify similar behavioral patterns across historical energy windows.

Power systems generate large volumes of sequential data such as **load demand and electricity prices**. Understanding repeating patterns within this data can help analysts identify operational regimes, detect anomalies, and study historical similarities between different time periods.

This system processes energy time-series data and performs the following tasks:

- Ingests and stores power system time-series datasets
- Cleans and preprocesses the data
- Segments the time-series into **sliding windows**
- Trains a **Gaussian Hidden Markov Model (HMM)** to learn latent energy regimes
- Generates regime sequences for each time window
- Computes similarity between windows using **log-likelihood scoring**
- Ranks the most similar windows for analytical exploration

The architecture separates the system into **frontend visualization, backend orchestration, machine learning processing, and persistent storage**, ensuring modularity and scalability.

This document presents the **High-Level Design (HLD), Low-Level Design (LLD), Model Training Flow, and Database Schema** for the system.

---

# 1. High-Level Design (HLD)

## Architecture Overview

<img src="/diag/hld.png" />

The Energy Regime Similarity Search System follows a **layered architecture** consisting of four primary components:

- **Frontend Layer**
- **Backend API Layer**
- **Machine Learning Processing Layer**
- **Database Layer**

The **React-based frontend** provides an interactive interface for analysts to explore time-series data, initiate similarity searches, and visualize results using charts.

The **FastAPI backend** serves as the central orchestration layer. It handles incoming requests from the frontend, performs request validation, coordinates ML processing tasks, and interacts with the database for storing and retrieving results.

The **ML layer** performs the computational tasks required for regime detection and similarity analysis. It includes preprocessing utilities, Hidden Markov Model training and inference components, and a similarity engine that ranks windows based on statistical likelihood.

Finally, the **PostgreSQL database** stores datasets, sliding windows, trained model parameters, regime sequences, and similarity search results. This allows the system to maintain a persistent history of models and analyses.

This layered separation ensures that the user interface, business logic, machine learning operations, and data storage remain **independent and maintainable**.

---

# 2. Low-Level Design (LLD)

<img src="/diag/lld.png" />

The Low-Level Design describes the internal interaction between the system components and the execution flow of requests within the backend and ML pipeline.

The system begins with a **user or analyst interacting with the React frontend**. The frontend sends requests to the backend when operations such as model training or similarity search are initiated.

The **FastAPI backend** performs the following tasks:

- Validates incoming requests
- Identifies the required dataset or model
- Triggers the appropriate ML service
- Retrieves data from the database
- Returns processed results to the frontend

Within the ML layer, the backend communicates with several specialized modules:

**Preprocessing Engine**

This component prepares the raw time-series data for modeling by performing:

- missing value handling
- normalization and scaling
- formatting data into model-compatible structures

**HMM Engine**

The Hidden Markov Model module is responsible for learning hidden regimes within the energy data. It trains a **Gaussian HMM** that models the probability distribution of observations and transitions between hidden states.

**Similarity Engine**

The similarity module evaluates how closely different windows resemble each other. It uses the trained HMM to compute **log-likelihood scores**, which quantify how likely a window is under the trained regime model.

The backend aggregates these scores, ranks them, and returns the **Top-K most similar windows** to the user.

All intermediate results and final outputs are stored in the database for reproducibility and future analysis.

---

# 3. Model Training Flow

<img src="/diag/dt.png" />

The model training pipeline is responsible for preparing the dataset and learning the hidden regimes present within the time-series data.

The training workflow consists of several sequential steps.

**Dataset Loading**

The process begins by loading the selected dataset from the database. The dataset contains time-series observations such as load demand and electricity price values recorded over time.

**Data Cleaning**

Missing values and inconsistencies within the dataset are handled during this stage to ensure reliable model training.

**Feature Normalization**

The numerical features are normalized using **StandardScaler**. Normalization ensures that features with different ranges contribute equally to the model learning process.

**Sliding Window Creation**

The time-series data is segmented into fixed-size **sliding windows**. Each window represents a short sequence of observations that captures local temporal behavior within the energy system.

**HMM Training**

A **Gaussian Hidden Markov Model** is trained using the generated windows. The model learns:

- transition probabilities between hidden states
- emission distributions representing observation likelihoods

These parameters allow the model to infer hidden regimes present within the energy data.

**Model Parameter Storage**

The trained model parameters, including transition matrices and emission distributions, are stored in the database for reuse during inference and similarity search.

**Regime Prediction**

After training, the model predicts the most probable sequence of hidden regimes for each sliding window.

**Result Storage**

The predicted regime sequences and associated likelihood metrics are stored in the database, making them available for future similarity comparisons.

---

# 4. Database Schema

<img src="/diag/db.png" />

The database schema supports the storage and retrieval of datasets, model parameters, window segments, and similarity results.

The design ensures that each component of the ML pipeline is traceable and reproducible.

Key entities include the following:

**Dataset**

Stores metadata about the uploaded time-series dataset, including the number of records, number of features, and data frequency.

**TimeSeries_Point**

Contains the raw time-series observations such as timestamped load and price values associated with each dataset.

**Window**

Represents segmented portions of the time-series data. Each window stores the start and end timestamps along with the window size used during segmentation.

**Model**

Stores trained Hidden Markov Model configurations including:

- number of hidden states
- window size used for training
- model likelihood metrics
- transition probability matrices
- emission parameters

**Regime_Sequence**

Contains the predicted hidden regime sequence for each window produced by the trained HMM. It also stores average likelihood scores representing how well the model explains the observed data.

**Similarity_Result**

Stores the results of similarity search operations. Each record represents the similarity score between a reference window and a compared window, along with the computed ranking.

The relationships between these tables allow the system to trace the full analytical pipeline from **raw dataset → window segmentation → model training → regime prediction → similarity search results**.

This schema design supports efficient querying, reproducibility of experiments, and extensibility for future analytical features.

---