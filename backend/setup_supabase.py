import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_supabase_database():
    """Set up the Supabase database with the required tables."""
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: Supabase URL and key must be provided in environment variables")
        return False
    
    # Read the SQL setup file for manual execution
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.join(script_dir, "setup_supabase_manual.sql")
    
    print(f"Reading SQL file from: {sql_path}")
    try:
        with open(sql_path, "r") as f:
            sql_commands = f.read()
        
        print("== MANUAL SUPABASE SETUP INSTRUCTIONS ==")
        print("1. Log in to your Supabase dashboard at: https://app.supabase.com")
        print(f"2. Select your project with URL: {supabase_url}")
        print("3. Go to the SQL Editor")
        print("4. Create a new query")
        print("5. Copy and paste the following SQL commands:")
        print("\n" + "="*50 + "\n")
        print(sql_commands)
        print("\n" + "="*50 + "\n")
        print("6. Execute the commands")
        print("\n7. After executing the SQL commands, check the Tables section to verify the tables were created.")
        
        # Also write to a file for convenience
        output_path = os.path.join(script_dir, "supabase_setup_instructions.txt")
        with open(output_path, "w") as f:
            f.write("== MANUAL SUPABASE SETUP INSTRUCTIONS ==\n")
            f.write(f"1. Log in to your Supabase dashboard at: https://app.supabase.com\n")
            f.write(f"2. Select your project with URL: {supabase_url}\n")
            f.write("3. Go to the SQL Editor\n")
            f.write("4. Create a new query\n")
            f.write("5. Copy and paste the following SQL commands:\n\n")
            f.write(sql_commands)
            f.write("\n\n6. Execute the commands\n")
            f.write("\n7. After executing the SQL commands, check the Tables section to verify the tables were created.\n")
        
        print(f"\nInstructions also saved to: {output_path}")
        return True
    except Exception as e:
        print(f"Error reading SQL file: {e}")
        return False

if __name__ == "__main__":
    setup_supabase_database() 