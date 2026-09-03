"""
PDF Report Generator for Phishing Detection History
Fixed for fpdf2 v2.7.8+ compatibility
"""
import sys
import json
import os
import io
import warnings
from datetime import datetime

# Suppress all deprecation warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=FutureWarning)

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    from fpdf import FPDF
except ImportError:
    print(json.dumps({'error': 'fpdf2 not installed. Run: pip install fpdf2'}))
    sys.exit(1)


class PDFReport(FPDF):
    def header(self):
        # Logo/Title area - using modern syntax (no ln= parameter)
        self.set_font('helvetica', 'B', 24)
        self.set_text_color(37, 99, 235)
        self.cell(0, 15, 'PhishGuard AI', new_x='LMARGIN', new_y='NEXT', align='L')
        
        self.set_font('helvetica', '', 12)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, 'Phishing Detection History Report', new_x='LMARGIN', new_y='NEXT', align='L')
        
        # Line separator
        self.set_draw_color(37, 99, 235)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()} | Generated on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', align='C')


def generate_pdf(data):
    username = data.get('username', 'User')
    records = data.get('records', [])
    
    pdf = PDFReport()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    
    # User info section
    pdf.set_font('helvetica', 'B', 14)
    pdf.set_text_color(31, 41, 55)
    pdf.cell(0, 10, f'User: {username}', new_x='LMARGIN', new_y='NEXT')
    
    pdf.set_font('helvetica', '', 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, f'Total Records: {len(records)}', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(0, 8, f'Report Date: {datetime.now().strftime("%B %d, %Y at %I:%M %p")}', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(5)
    
    # Summary statistics
    phishing_count = sum(1 for r in records if r.get('classification') == 'phishing')
    legitimate_count = len(records) - phishing_count
    
    pdf.set_fill_color(243, 244, 246)
    pdf.rect(10, pdf.get_y(), 190, 25, style='F')
    pdf.set_xy(15, pdf.get_y() + 3)
    
    pdf.set_font('helvetica', 'B', 11)
    pdf.set_text_color(31, 41, 55)
    pdf.cell(60, 8, 'Summary:', new_x='LMARGIN', new_y='NEXT')
    
    pdf.set_font('helvetica', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(60, 6, f'  Phishing Detected: {phishing_count}', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(60, 6, f'  Legitimate: {legitimate_count}', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(8)
    
    # Records table header
    pdf.set_fill_color(37, 99, 235)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font('helvetica', 'B', 10)
    pdf.set_draw_color(37, 99, 235)
    
    col_widths = [25, 30, 25, 30, 25, 55]
    headers = ['Date', 'Type', 'Result', 'Risk Level', 'Score', 'Indicators']
    
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], 10, header, border=1, fill=True, align='C')
    pdf.ln()
    
    # Records data
    pdf.set_font('helvetica', '', 9)
    
    for record in records:
        classification = record.get('classification', 'unknown')
        risk_level = record.get('risk_level', 'Unknown')
        
        if classification == 'phishing':
            pdf.set_text_color(153, 27, 27)
            fill_color = (254, 242, 242)
        else:
            pdf.set_text_color(22, 101, 52)
            fill_color = (240, 253, 244)
        
        y_start = pdf.get_y()
        
        # Date formatting
        date_str = record.get('created_at', 'N/A')
        if date_str and date_str != 'N/A':
            try:
                dt = datetime.strptime(str(date_str), '%Y-%m-%d %H:%M:%S')
                date_str = dt.strftime('%m/%d/%Y')
            except:
                pass
        
        # Explanation/indicators
        explanation = record.get('explanation', 'No indicators')
        if not explanation or explanation.strip() == '':
            explanation = 'No detailed indicators'
        
        # Score
        final_score = record.get('final_score', 0)
        score_str = f"{float(final_score) * 100:.1f}%" if final_score else 'N/A'
        
        # Print row
        pdf.set_fill_color(*fill_color)
        
        # Column 1: Date
        pdf.cell(col_widths[0], 12, str(date_str), border=1, align='C', fill=True)
        
        # Column 2: Type
        pdf.cell(col_widths[1], 12, str(record.get('input_type', 'N/A')).upper(), border=1, align='C', fill=True)
        
        # Column 3: Result
        pdf.cell(col_widths[2], 12, str(classification).upper(), border=1, align='C', fill=True)
        
        # Column 4: Risk
        pdf.cell(col_widths[3], 12, str(risk_level), border=1, align='C', fill=True)
        
        # Column 5: Score
        pdf.cell(col_widths[4], 12, score_str, border=1, align='C', fill=True)
        
        # Column 6: Indicators (multi-line)
        x = pdf.get_x()
        y = pdf.get_y()
        pdf.multi_cell(col_widths[5], 6, str(explanation), border=1, align='L', fill=True)
        
        # Move to next row
        pdf.set_xy(10, y_start + 12)
        
        # Check if we need a new page
        if pdf.get_y() > 250:
            pdf.add_page()
            # Re-print header
            pdf.set_fill_color(37, 99, 235)
            pdf.set_text_color(255, 255, 255)
            pdf.set_font('helvetica', 'B', 10)
            for i, header in enumerate(headers):
                pdf.cell(col_widths[i], 10, header, border=1, fill=True, align='C')
            pdf.ln()
            pdf.set_font('helvetica', '', 9)
    
    # Footer note
    pdf.ln(10)
    pdf.set_font('helvetica', 'I', 9)
    pdf.set_text_color(128, 128, 128)
    pdf.multi_cell(0, 6, 'Note: This report was generated automatically by the PhishGuard AI system. Scores indicate the probability of phishing detection, where higher percentages suggest greater risk.')
    
    # Save to temp file
    output_path = os.path.join(os.path.dirname(__file__), '..', 'temp_report.pdf')
    pdf.output(output_path)
    
    # Read and encode to base64
    import base64
    with open(output_path, 'rb') as f:
        pdf_bytes = f.read()
    
    # Clean up temp file
    try:
        os.remove(output_path)
    except:
        pass
    
    filename = f"phishguard_history_{username}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return {
        'pdf_base64': base64.b64encode(pdf_bytes).decode('utf-8'),
        'filename': filename
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input file specified'}))
        return
    
    input_file = os.path.normpath(sys.argv[1])
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(json.dumps({'error': f'Failed to read input: {str(e)}'}))
        return
    
    try:
        result = generate_pdf(data)
        # Only output JSON - no other print statements
        sys.stdout.write(json.dumps(result, ensure_ascii=False))
        sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(json.dumps({'error': f'PDF generation failed: {str(e)}'}))
        sys.stdout.flush()


if __name__ == '__main__':
    main()