from app.db import supabase

def save_analysis(data):

    supabase.table(
        "analysis_history"
    ).insert(
        data
    ).execute()