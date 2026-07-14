@echo off
title BOUCLIER - AI MODEL RETRAINING
color 0D

echo =================================================================
echo        BOUCLIER SAAS - AI MODEL RETRAINING ENGINE
echo =================================================================
echo.
echo [*] Generating Professional Jupyter Notebook...
python generate_notebook.py

echo [*] Executing Notebook Analysis (This may take 2-5 minutes)...
cd backend
python -m nbconvert --to notebook --execute --ExecutePreprocessor.timeout=600 notebooks/Analyst_Report.ipynb --output Analyst_Report_Executed.ipynb

echo.
echo [+] Analysis Complete!
echo [+] Professional Reports: backend/notebooks/Analyst_Report_Executed.ipynb
echo [+] Production Models:  backend/app/ml/*.pkl
echo.
pause
