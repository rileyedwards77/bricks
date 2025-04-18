#!/usr/bin/env python3
import re
import json
import os

def convert_md_to_json(md_file, json_file):
    """
    Convert a Markdown table to JSON format.
    
    Args:
        md_file (str): Path to the Markdown file
        json_file (str): Path to the output JSON file
    """
    print(f"Converting {md_file} to {json_file}...")
    
    # First, load existing JSON to preserve status
    existing_dict = {}
    if os.path.exists(json_file):
        try:
            with open(json_file, 'r') as f:
                existing_items = json.load(f)
                
            # Create a dictionary of existing items by ID for quick lookup
            existing_dict = {item['id']: item for item in existing_items}
            print(f"Loaded {len(existing_dict)} existing items to preserve status.")
        except Exception as e:
            print(f"Error reading existing JSON file: {e}")
    
    # Read the Markdown file
    with open(md_file, 'r') as f:
        md_content = f.read()
    
    # Extract the table rows
    lines = md_content.strip().split('\n')
    
    # Find the header row and data rows
    header_row = None
    separator_row = None
    data_rows = []
    
    for i, line in enumerate(lines):
        if '| ITEMTYPE | ITEMID |' in line:
            header_row = i
        elif header_row is not None and i == header_row + 1:
            separator_row = i
        elif separator_row is not None and i > separator_row and '|' in line:
            data_rows.append(line)
    
    if header_row is None or separator_row is None:
        print("Could not find table header or separator in the Markdown file.")
        return []
    
    # Parse each row
    items = []
    for row in data_rows:
        # Split by | and remove empty strings
        columns = [col.strip() for col in row.split('|')]
        # Remove empty elements at the beginning and end
        if not columns[0]:
            columns = columns[1:]
        if not columns[-1]:
            columns = columns[:-1]
        
        if len(columns) >= 7:  # Ensure we have all required columns
            item_type = columns[0]
            item_id = columns[1]
            color = int(columns[2])
            min_qty = int(columns[3])
            condition = columns[4]
            description = columns[5]
            remarks = columns[6]
            
            # Default status is pending, but preserve existing status if available
            status = "pending"
            if item_id in existing_dict:
                status = existing_dict[item_id].get('status', 'pending')
                print(f"Preserving status '{status}' for item {item_id}")
            
            items.append({
                "id": item_id,
                "name": description,
                "status": status,
                "color": color,
                "minQty": min_qty,
                "condition": condition,
                "remarks": remarks
            })
    
    # Write the JSON file
    with open(json_file, 'w') as f:
        json.dump(items, f, indent=4)
    
    print(f"Converted {len(items)} items to JSON format.")
    return items

if __name__ == "__main__":
    md_file = "BrickLinkWantedList.md"
    json_file = "wantedList.json"
    
    items = convert_md_to_json(md_file, json_file)
    print(f"Successfully converted {len(items)} items to JSON format.")
