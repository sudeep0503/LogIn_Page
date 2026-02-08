import pandas as pd
from collections import OrderedDict

KEY_COLUMN = "Questions"


# ---------------------------------------------------
# Helpers
# ---------------------------------------------------

def normalize(v):
    if pd.isna(v):
        return ""
    return str(v).strip()


def align_columns(old_df, new_df):
    """Make both dataframes share same columns"""
    all_columns = list(OrderedDict.fromkeys(list(old_df.columns) + list(new_df.columns)))
    return old_df.reindex(columns=all_columns), new_df.reindex(columns=all_columns)


def build_final_dataframe(old_df, new_df):
    """Rebuild final dataset preserving history"""

    old_df, new_df = align_columns(old_df, new_df)

    old_keys = set(old_df[KEY_COLUMN].dropna())
    new_keys = set(new_df[KEY_COLUMN].dropna())

    added_keys = new_keys - old_keys
    deleted_keys = old_keys - new_keys
    common_keys = old_keys & new_keys

    frames = []

    # unchanged history
    frames.append(old_df[old_df[KEY_COLUMN].isin(deleted_keys)])

    # updated (take new)
    frames.append(new_df[new_df[KEY_COLUMN].isin(common_keys)])

    # added
    frames.append(new_df[new_df[KEY_COLUMN].isin(added_keys)])

    final_df = pd.concat(frames, ignore_index=True)

    return final_df, added_keys, deleted_keys, common_keys, old_df, new_df

def safe_write(ws, row, col, value, fmt):
    import math

    if pd.isna(value):
        ws.write_blank(row, col, None, fmt)
    elif isinstance(value, float) and (math.isinf(value) or math.isnan(value)):
        ws.write_blank(row, col, None, fmt)
    else:
        ws.write(row, col, value, fmt)


# ---------------------------------------------------
# Cell level diff writer
# ---------------------------------------------------

def apply_cell_diff(ws, final_df, old_df, new_df,
                    added_keys, deleted_keys, common_keys,
                    workbook):

    fmt_added = workbook.add_format({'bg_color': '#C6EFCE'})   # green
    fmt_deleted = workbook.add_format({'bg_color': '#FFC7CE'}) # red
    fmt_updated = workbook.add_format({'bg_color': '#FFF2CC'}) # yellow

    # group data
    old_groups = {k: g.reset_index(drop=True) for k, g in old_df.groupby(KEY_COLUMN)}
    new_groups = {k: g.reset_index(drop=True) for k, g in new_df.groupby(KEY_COLUMN)}

    for r, row in final_df.iterrows():
        excel_row = r + 1
        key = row[KEY_COLUMN]

        # New rows
        if key in added_keys:
            ws.set_row(excel_row, None, fmt_added)
            continue

        # Deleted rows
        if key in deleted_keys:
            ws.set_row(excel_row, None, fmt_deleted)
            continue

        # Updated rows → find best matching old row
        if key in common_keys:

            new_row = row
            old_group = old_groups[key]

            best_match = None
            best_score = -1

            for _, old_row in old_group.iterrows():
                score = sum(normalize(old_row[c]) == normalize(new_row[c]) for c in final_df.columns)
                if score > best_score:
                    best_score = score
                    best_match = old_row

            if best_match is None:
                continue

            # cell comparison
            for c, col in enumerate(final_df.columns):

                old_val = normalize(best_match[col])
                new_val = normalize(new_row[col])

                if old_val != new_val:
                    safe_write(ws, excel_row, c, new_row[col], fmt_updated)



# ---------------------------------------------------
# Main engine
# ---------------------------------------------------

def generate_diff_excel(old_file, new_file, output_file):

    print("Reading workbooks...")

    old_sheets = pd.read_excel(old_file, sheet_name=None, engine="openpyxl")
    new_sheets = pd.read_excel(new_file, sheet_name=None, engine="openpyxl")

    all_sheet_names = list(OrderedDict.fromkeys(list(old_sheets.keys()) + list(new_sheets.keys())))

    with pd.ExcelWriter(output_file, engine="xlsxwriter") as writer:

        workbook = writer.book

        for sheet in all_sheet_names:

            print("Processing:", sheet)

            old_df = old_sheets.get(sheet, pd.DataFrame())
            new_df = new_sheets.get(sheet, pd.DataFrame())

            if old_df.empty and new_df.empty:
                continue

            if old_df.empty:
                final_df = new_df.copy()
                final_df.to_excel(writer, sheet_name=sheet, index=False)
                ws = writer.sheets[sheet]
                ws.set_column(0, len(final_df.columns)-1, None, workbook.add_format({'bg_color': '#C6EFCE'}))
                continue

            if new_df.empty:
                final_df = old_df.copy()
                final_df.to_excel(writer, sheet_name=sheet, index=False)
                ws = writer.sheets[sheet]
                ws.set_column(0, len(final_df.columns)-1, None, workbook.add_format({'bg_color': '#FFC7CE'}))
                continue

            final_df, added_keys, deleted_keys, common_keys, old_df, new_df = build_final_dataframe(old_df, new_df)

            final_df.to_excel(writer, sheet_name=sheet, index=False)
            ws = writer.sheets[sheet]

            apply_cell_diff(ws, final_df, old_df, new_df,
                            added_keys, deleted_keys, common_keys,
                            workbook)

    print("\nFinished →", output_file)


# ---------------------------------------------------
# Run
# ---------------------------------------------------

if __name__ == "__main__":

    OLD_FILE = "Old_Version.xlsx"
    NEW_FILE = "New_Version.xlsx"
    OUTPUT_FILE = "Final_Diff_Output.xlsx"

    generate_diff_excel(OLD_FILE, NEW_FILE, OUTPUT_FILE)
