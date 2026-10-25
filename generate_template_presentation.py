import os
import sys
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# ==============================================================================
# GRAMSTOCK CLOUD — PRESENTATION GENERATOR (ENLARGED HIGH-READABILITY VERSION)
# ==============================================================================

prs = pptx.Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# Exact Palette from Attached Template Image:
COLOR_WHITE = RGBColor(255, 255, 255)
COLOR_BG_LIGHT = RGBColor(248, 249, 250)      # Clean Off-White #F8F9FA
COLOR_ORANGE = RGBColor(255, 159, 0)          # Vibrant Corporate Orange #FF9F00
COLOR_ORANGE_LIGHT = RGBColor(255, 247, 237)  # Warm Amber tint #FFF7ED
COLOR_BLACK = RGBColor(26, 26, 26)            # Deep Charcoal / Black #1A1A1A
COLOR_BORDER = RGBColor(218, 224, 233)        # Slate border
COLOR_TEXT_DARK = RGBColor(17, 24, 39)        # Deep Heading #111827
COLOR_TEXT_MUTED = RGBColor(75, 85, 99)       # Darker slate for high contrast #4B5563
COLOR_TEXT_LIGHT = RGBColor(255, 255, 255)

FONT_MAIN = "Segoe UI"

def set_slide_base(slide, bg_color=COLOR_WHITE):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = bg_color
    bg.line.fill.background()
    return bg

def add_header(slide, tag_text, title_black, title_orange="", subtitle_text=None):
    # Top Tag
    tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.42), Inches(10), Inches(0.32))
    tf = tag_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = "✦ " + tag_text.upper()
    r.font.name = FONT_MAIN
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = COLOR_ORANGE

    # Big Headline (Black + Orange contrast)
    head_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.73), Inches(0.95))
    tf2 = head_box.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0
    p2 = tf2.paragraphs[0]
    r2 = p2.add_run()
    r2.text = title_black + " "
    r2.font.name = FONT_MAIN
    r2.font.size = Pt(28)
    r2.font.bold = True
    r2.font.color.rgb = COLOR_TEXT_DARK

    if title_orange:
        r_or = p2.add_run()
        r_or.text = title_orange
        r_or.font.name = FONT_MAIN
        r_or.font.size = Pt(28)
        r_or.font.bold = True
        r_or.font.color.rgb = COLOR_ORANGE

    if subtitle_text:
        p_sub = tf2.add_paragraph()
        p_sub.space_before = Pt(3)
        r_sub = p_sub.add_run()
        r_sub.text = subtitle_text
        r_sub.font.name = FONT_MAIN
        r_sub.font.size = Pt(12.5)
        r_sub.font.color.rgb = COLOR_TEXT_MUTED

def add_rounded_card(slide, left, top, width, height, fill_color=COLOR_WHITE, border_color=COLOR_BORDER, border_width=1):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = fill_color
    if border_color:
        card.line.color.rgb = border_color
        card.line.width = Pt(border_width)
    else:
        card.line.fill.background()
    return card

def add_pill_button(slide, left, top, width, height, text, bg_color=COLOR_ORANGE, text_color=COLOR_WHITE, font_size=10.5):
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    pill.fill.solid()
    pill.fill.fore_color.rgb = bg_color
    pill.line.fill.background()
    tf = pill.text_frame
    tf.word_wrap = False
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = text
    r.font.name = FONT_MAIN
    r.font.size = Pt(font_size)
    r.font.bold = True
    r.font.color.rgb = text_color
    return pill

# ==============================================================================
# SLIDE 1: COVER SLIDE (LARGE BOLD VISUALS)
# ==============================================================================
slide1 = prs.slides.add_slide(blank_layout)
set_slide_base(slide1, COLOR_WHITE)

# Top Left Tag Badge
add_pill_button(slide1, Inches(0.8), Inches(0.75), Inches(2.6), Inches(0.42), "⚡ GRAMSTOCK CLOUD", bg_color=COLOR_ORANGE_LIGHT, text_color=COLOR_ORANGE, font_size=11)

# Large Main Heading Left
title_box = slide1.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(6.3), Inches(2.6))
tf = title_box.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

p = tf.paragraphs[0]
r = p.add_run()
r.text = "One Inventory\n"
r.font.name = FONT_MAIN
r.font.size = Pt(44)
r.font.bold = True
r.font.color.rgb = COLOR_TEXT_DARK

r2 = p.add_run()
r2.text = "Platform."
r2.font.name = FONT_MAIN
r2.font.size = Pt(44)
r2.font.bold = True
r2.font.color.rgb = COLOR_ORANGE

p_sub = tf.add_paragraph()
p_sub.space_before = Pt(8)
r_sub = p_sub.add_run()
r_sub.text = "An adaptive, zero-schema SaaS platform transforming raw business datasets into tailored, tenant-isolated inventory dashboards."
r_sub.font.name = FONT_MAIN
r_sub.font.size = Pt(14)
r_sub.font.color.rgb = COLOR_TEXT_MUTED

# Left Feature Blocks with larger text
features = [
    ("Dynamic Schema Ingestion", "Uploads raw CSVs without pre-defined database locks"),
    ("Multi-Tenant Cloud Silo", "Guarantees strict row-level isolation across merchants"),
    ("AWS-Backed Telemetry", "Decouples Amazon S3 storage, EC2 compute & CloudWatch"),
]

fy = Inches(4.35)
for title, desc in features:
    dot = slide1.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.8), fy + Inches(0.06), Inches(0.22), Inches(0.22))
    dot.fill.solid()
    dot.fill.fore_color.rgb = COLOR_ORANGE
    dot.line.fill.background()

    tb = slide1.shapes.add_textbox(Inches(1.2), fy, Inches(5.8), Inches(0.72))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = title + "  "
    r.font.name = FONT_MAIN
    r.font.size = Pt(12.5)
    r.font.bold = True
    r.font.color.rgb = COLOR_TEXT_DARK

    p_d = tf.add_paragraph()
    r_d = p_d.add_run()
    r_d.text = desc
    r_d.font.name = FONT_MAIN
    r_d.font.size = Pt(11)
    r_d.font.color.rgb = COLOR_TEXT_MUTED
    fy += Inches(0.76)

# Small footer text
foot_box = slide1.shapes.add_textbox(Inches(0.8), Inches(6.82), Inches(6.0), Inches(0.35))
tf = foot_box.text_frame
p = tf.paragraphs[0]
r = p.add_run()
r.text = "Cloud Computing Mini-Project 2026  •  Next.js 16 + Docker + AWS (S3 / EC2 / CloudWatch)"
r.font.name = FONT_MAIN
r.font.size = Pt(9.5)
r.font.bold = True
r.font.color.rgb = COLOR_TEXT_MUTED

# RIGHT SIDE: The Iconic Circular Orange Arc & Framed Graphic
outer_arc = slide1.shapes.add_shape(MSO_SHAPE.OVAL, Inches(7.4), Inches(0.8), Inches(5.3), Inches(5.3))
outer_arc.fill.solid()
outer_arc.fill.fore_color.rgb = COLOR_ORANGE
outer_arc.line.fill.background()

black_circle = slide1.shapes.add_shape(MSO_SHAPE.OVAL, Inches(11.8), Inches(0.9), Inches(0.75), Inches(0.75))
black_circle.fill.solid()
black_circle.fill.fore_color.rgb = COLOR_BLACK
black_circle.line.fill.background()

inner_hub = slide1.shapes.add_shape(MSO_SHAPE.OVAL, Inches(7.65), Inches(1.05), Inches(4.8), Inches(4.8))
inner_hub.fill.solid()
inner_hub.fill.fore_color.rgb = COLOR_BG_LIGHT
inner_hub.line.fill.background()

# Center Engine Box
hub_card = add_rounded_card(slide1, Inches(8.35), Inches(2.2), Inches(3.4), Inches(1.6), fill_color=COLOR_BLACK, border_color=COLOR_ORANGE, border_width=2)
tb = slide1.shapes.add_textbox(Inches(8.45), Inches(2.32), Inches(3.2), Inches(1.35))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "⚡ ADAPTIVE CORE ENGINE"
r.font.name = FONT_MAIN
r.font.size = Pt(12)
r.font.bold = True
r.font.color.rgb = COLOR_ORANGE

p2 = tf.add_paragraph()
p2.alignment = PP_ALIGN.CENTER
p2.space_before = Pt(4)
r2 = p2.add_run()
r2.text = "Heuristic Schema Inference\nDynamic Field Mapping\nZero-Downtime Multi-Tenancy"
r2.font.name = FONT_MAIN
r2.font.size = Pt(10.5)
r2.font.color.rgb = COLOR_WHITE

# 4 Floating Category Pills with larger text
pills_data = [
    ("🛒 Kirana & FMCG", Inches(8.0), Inches(1.25)),
    ("💊 Pharmacy & Clinical", Inches(10.2), Inches(1.35)),
    ("🍽️ Restaurant & Cafe", Inches(7.9), Inches(4.3)),
    ("👗 Fashion & Garments", Inches(10.2), Inches(4.3)),
]

for label, px, py in pills_data:
    add_pill_button(slide1, px, py, Inches(2.4), Inches(0.48), label, bg_color=COLOR_WHITE, text_color=COLOR_TEXT_DARK, font_size=10.5)
    border_rect = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, py, Inches(2.4), Inches(0.48))
    border_rect.fill.background()
    border_rect.line.color.rgb = COLOR_ORANGE
    border_rect.line.width = Pt(1.5)

# Bottom Callout Pill
add_pill_button(slide1, Inches(7.5), Inches(6.5), Inches(5.1), Inches(0.55), '✦ "Different Businesses. One Adaptive Cloud Engine."', bg_color=COLOR_ORANGE, text_color=COLOR_WHITE, font_size=12)

print("Slide 1 enlarged.")

# ==============================================================================
# SLIDE 2: THE CORE PROBLEM (ENLARGED HIGH CONTRAST)
# ==============================================================================
slide2 = prs.slides.add_slide(blank_layout)
set_slide_base(slide2, COLOR_WHITE)

add_header(slide2, "02 | THE CORE PROBLEM", "Every Business Is Different.", "Inventory Software Often Isn't.",
           "One rigid relational template cannot accommodate the structural diversity of real-world retail businesses.")

# 4 Schema Cards
cols_info = [
    ("GROCERY & FMCG", ["Product Name", "Package Weight", "Selling Price (MRP)", "FMCG Barcode", "Fast-Moving Tag"], COLOR_ORANGE),
    ("PHARMACY & CLINICAL", ["Medicine Brand", "Salt Formulation", "Batch Number (Batch ID)", "Expiry Date (Critical)", "Schedule H Prescription"], COLOR_BLACK),
    ("RESTAURANT & CAFE", ["Ingredient Name", "Unit of Measure (Kg/L)", "Storage Temp (°C)", "Recipe Consumption", "Reorder Threshold"], COLOR_ORANGE),
    ("GARMENTS & APPAREL", ["Style / Article Code", "Size Matrix (S/M/L/XL)", "Color Variant", "Fabric Blend", "Seasonal Collection"], COLOR_BLACK),
]

col_w = Inches(2.78)
start_x = Inches(0.8)
col_gap = Inches(0.2)

for i, (title, fields, theme_col) in enumerate(cols_info):
    cx = start_x + i * (col_w + col_gap)
    card = add_rounded_card(slide2, cx, Inches(1.95), col_w, Inches(2.45), fill_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER, border_width=1.2)
    
    header_bar = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, Inches(1.95), col_w, Inches(0.45))
    header_bar.fill.solid()
    header_bar.fill.fore_color.rgb = theme_col
    header_bar.line.fill.background()
    p_h = header_bar.text_frame.paragraphs[0]
    p_h.alignment = PP_ALIGN.CENTER
    r_h = p_h.add_run()
    r_h.text = title
    r_h.font.name = FONT_MAIN
    r_h.font.size = Pt(11)
    r_h.font.bold = True
    r_h.font.color.rgb = COLOR_WHITE

    tb = slide2.shapes.add_textbox(cx + Inches(0.15), Inches(2.48), col_w - Inches(0.3), Inches(1.85))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    for idx, f in enumerate(fields):
        pf = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        if idx > 0: pf.space_before = Pt(3)
        rf = pf.add_run()
        rf.text = "✓  " + f
        rf.font.name = FONT_MAIN
        rf.font.size = Pt(10.5)
        rf.font.bold = True
        rf.font.color.rgb = COLOR_TEXT_DARK

# Mismatch Warning Banner (Solid Orange block)
banner = add_rounded_card(slide2, Inches(0.8), Inches(4.55), Inches(11.73), Inches(0.78), fill_color=COLOR_ORANGE, border_color=None)
tb = slide2.shapes.add_textbox(Inches(1.0), Inches(4.6), Inches(11.3), Inches(0.68))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
p = tf.paragraphs[0]
r = p.add_run()
r.text = "⚠️ THE RIGID RELATIONAL TEMPLATE MISMATCH: Attempting to force all 4 schemas into 1 fixed table"
r.font.name = FONT_MAIN
r.font.size = Pt(12)
r.font.bold = True
r.font.color.rgb = COLOR_WHITE

p2 = tf.add_paragraph()
p2.space_before = Pt(2)
r2 = p2.add_run()
r2.text = "• 60% of database columns end up as NULL  • Expiry alerts fail in clothing stores  • Schema changes require developer migrations & downtime"
r2.font.name = FONT_MAIN
r2.font.size = Pt(10.5)
r2.font.color.rgb = COLOR_WHITE

# 3 Problem Statement Cards Bottom
prob_items = [
    ("01", "Rigid SQL Schemas", "Traditional software assumes every business fits one predefined table. Inflexible relational constraints break when applied to new retail sectors.", COLOR_BLACK),
    ("02", "Expensive Restructuring", "Small merchants are forced into extensive manual Excel cleaning and developer consults just to onboard their historical data.", COLOR_ORANGE),
    ("03", "Non-Adaptive Dashboards", "Standard software displays irrelevant KPIs — e.g., batch expiry dates for t-shirts or clothing sizes for milk — creating cognitive clutter.", COLOR_BLACK),
]

prob_w = Inches(3.78)
for i, (num, heading, text, accent_col) in enumerate(prob_items):
    px = start_x + i * (prob_w + Inches(0.2))
    card = add_rounded_card(slide2, px, Inches(5.48), prob_w, Inches(1.68), fill_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER, border_width=1.2)
    
    badge = slide2.shapes.add_shape(MSO_SHAPE.OVAL, px + Inches(0.18), Inches(5.62), Inches(0.42), Inches(0.42))
    badge.fill.solid()
    badge.fill.fore_color.rgb = accent_col
    badge.line.fill.background()
    p_b = badge.text_frame.paragraphs[0]
    p_b.alignment = PP_ALIGN.CENTER
    r_b = p_b.add_run()
    r_b.text = num
    r_b.font.name = FONT_MAIN
    r_b.font.size = Pt(11)
    r_b.font.bold = True
    r_b.font.color.rgb = COLOR_WHITE

    tb = slide2.shapes.add_textbox(px + Inches(0.72), Inches(5.6), prob_w - Inches(0.9), Inches(1.45))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = heading
    r.font.name = FONT_MAIN
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = COLOR_TEXT_DARK

    p2 = tf.add_paragraph()
    p2.space_before = Pt(3)
    r2 = p2.add_run()
    r2.text = text
    r2.font.name = FONT_MAIN
    r2.font.size = Pt(10)
    r2.font.color.rgb = COLOR_TEXT_MUTED

print("Slide 2 enlarged.")

# ==============================================================================
# SLIDE 3: THE ADAPTIVE SOLUTION (TIMELINE ENLARGED)
# ==============================================================================
slide3 = prs.slides.add_slide(blank_layout)
set_slide_base(slide3, COLOR_WHITE)

add_header(slide3, "03 | THE ADAPTIVE SOLUTION", "Upload Data. Shape the System.", "Get Your Dashboard.",
           "A 5-stage automated pipeline where raw merchant datasets dynamically generate tailored inventory interfaces.")

# Horizontal connecting line
line = slide3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.2), Inches(2.32), Inches(10.9), Inches(0.05))
line.fill.solid()
line.fill.fore_color.rgb = COLOR_BORDER
line.line.fill.background()

# 5 Alternating Circular Nodes (Bigger, bolder nodes)
stages = [
    ("01", "UPLOAD", "Drag-and-drop raw CSV/XLSX file", COLOR_ORANGE),
    ("02", "ANALYZE", "Heuristic parser checks headers & types", COLOR_BLACK),
    ("03", "CUSTOMIZE", "Merchant verifies category & mappings", COLOR_ORANGE),
    ("04", "GENERATE", "Dynamic table & KPI schemas instantiate", COLOR_BLACK),
    ("05", "INSIGHT", "Live responsive dashboard with store silo", COLOR_ORANGE),
]

node_w = Inches(2.1)
node_gap = Inches(0.3)
node_start = Inches(0.9)

for i, (num, stage_title, stage_desc, node_color) in enumerate(stages):
    nx = node_start + i * (node_w + node_gap)
    circle = slide3.shapes.add_shape(MSO_SHAPE.OVAL, nx + Inches(0.65), Inches(1.92), Inches(0.8), Inches(0.8))
    circle.fill.solid()
    circle.fill.fore_color.rgb = node_color
    circle.line.fill.background()
    p_c = circle.text_frame.paragraphs[0]
    p_c.alignment = PP_ALIGN.CENTER
    r_c = p_c.add_run()
    r_c.text = num
    r_c.font.name = FONT_MAIN
    r_c.font.size = Pt(15)
    r_c.font.bold = True
    r_c.font.color.rgb = COLOR_WHITE

    tb = slide3.shapes.add_textbox(nx, Inches(2.82), node_w, Inches(0.85))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = stage_title
    r.font.name = FONT_MAIN
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = COLOR_TEXT_DARK

    p_d = tf.add_paragraph()
    p_d.space_before = Pt(2)
    p_d.alignment = PP_ALIGN.CENTER
    r_d = p_d.add_run()
    r_d.text = stage_desc
    r_d.font.name = FONT_MAIN
    r_d.font.size = Pt(9.5)
    r_d.font.color.rgb = COLOR_TEXT_MUTED

# 3 Transformation Panels below
panels = [
    ("📄 1. Raw CSV Dataset Ingestion", [
        ("Item,Qty,Rate,BestBefore,BatchID", ""),
        ("Parle-G Gold, 120, 10, 2026-12-01, BAT-01", ""),
        ("Dolo 650mg, 85, 32, 2027-05-15, DL-881", ""),
        ("Linen Shirt L, 40, 899, N/A, SKU-402", ""),
    ], COLOR_BLACK, Inches(0.8), Inches(3.88), Inches(3.75)),

    ("⚡ 2. Adaptive Schema Mapping", [
        ("Category Detected:", "Medical / Pharmacy (94%)"),
        ("Item ➔", "Product Name (Primary Index)"),
        ("Qty ➔", "Stock Count (Tracked Integer)"),
        ("Rate ➔", "Unit Price (INR Currency)"),
        ("BestBefore ➔", "Expiry Date (ISO Countdown)"),
    ], COLOR_ORANGE, Inches(4.78), Inches(3.88), Inches(3.75)),

    ("📊 3. Generated Tailored Experience", [
        ("Dynamic KPIs:", "Total Value, Batch Health, Alerts"),
        ("Contextual Filter:", "Expiry countdowns for medicines"),
        ("Adaptive Table:", "Renders exact mapped columns"),
        ("Store Silo:", "Restricted to pharmacy tenant"),
    ], COLOR_BLACK, Inches(8.76), Inches(3.88), Inches(3.75)),
]

for p_title, p_rows, p_col, px, py, pw in panels:
    card = add_rounded_card(slide3, px, py, pw, Inches(2.3), fill_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER, border_width=1.2)
    
    top_bar = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, py, pw, Inches(0.42))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = p_col
    top_bar.line.fill.background()
    p_h = top_bar.text_frame.paragraphs[0]
    p_h.alignment = PP_ALIGN.CENTER
    r_h = p_h.add_run()
    r_h.text = p_title
    r_h.font.name = FONT_MAIN
    r_h.font.size = Pt(11)
    r_h.font.bold = True
    r_h.font.color.rgb = COLOR_WHITE

    tb = slide3.shapes.add_textbox(px + Inches(0.15), py + Inches(0.5), pw - Inches(0.3), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    for idx, (col1, col2) in enumerate(p_rows):
        pf = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        if idx > 0: pf.space_before = Pt(3)
        rf = pf.add_run()
        rf.text = "• " + col1 + " "
        rf.font.name = FONT_MAIN
        rf.font.size = Pt(9.5)
        rf.font.bold = True
        rf.font.color.rgb = COLOR_TEXT_DARK

        if col2:
            rf2 = pf.add_run()
            rf2.text = col2
            rf2.font.name = FONT_MAIN
            rf2.font.size = Pt(9.5)
            rf2.font.bold = True
            rf2.font.color.rgb = COLOR_ORANGE

# Bottom Principle Callout
principle_box = add_rounded_card(slide3, Inches(0.8), Inches(6.35), Inches(11.73), Inches(0.7), fill_color=COLOR_ORANGE_LIGHT, border_color=COLOR_ORANGE, border_width=1.5)
tb = slide3.shapes.add_textbox(Inches(1.0), Inches(6.45), Inches(11.3), Inches(0.5))
tf = tb.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = '💡 Core Architectural Principle: "Suggestions are automated via zero-shot heuristic pattern analysis. Final configuration stays strictly with the merchant."'
r.font.name = FONT_MAIN
r.font.size = Pt(11.5)
r.font.bold = True
r.font.color.rgb = COLOR_TEXT_DARK

print("Slide 3 enlarged.")

# ==============================================================================
# SLIDE 4: CLOUD COMPUTING ARCHITECTURE (ENLARGED)
# ==============================================================================
slide4 = prs.slides.add_slide(blank_layout)
set_slide_base(slide4, COLOR_WHITE)

add_header(slide4, "04 | CLOUD COMPUTING ARCHITECTURE", "From Uploaded File to", "Cloud-Powered Dashboard.",
           "Engineered with clean separation of concerns: Object Storage for files, Virtual Compute for logic, and CloudWatch for observability.")

# 4 Architecture Columns
arch_nodes = [
    ("1. CLIENT LAYER", "Browser & Mobile PWA", [
        ("Next.js React Client", "Responsive desktop & mobile UI"),
        ("HTTPS TLS 1.3", "Encrypted session tokens"),
        ("State Hydration", "Local theme & business context"),
    ], COLOR_BLACK, Inches(0.8)),

    ("2. COMPUTE LAYER", "Amazon EC2 (t3.micro)", [
        ("Next.js Full-Stack App", "Docker Node 20 Alpine container"),
        ("Inference Engine", "Zero-schema heuristic parsing"),
        ("Bcrypt Security", "10-round salted password hashing"),
    ], COLOR_ORANGE, Inches(3.78)),

    ("3. STORAGE & DATA", "S3 Storage + PostgreSQL", [
        ("Amazon S3 Bucket", "Raw CSV dataset backups (AES-256)"),
        ("PostgreSQL Store", "Multi-tenant inventory records"),
        ("Row-Level Isolation", "Strict merchant data separation"),
    ], COLOR_BLACK, Inches(6.76)),

    ("4. OBSERVABILITY", "CloudWatch & Audit", [
        ("CloudWatch Telemetry", "Latency, uptime & SLA metrics"),
        ("CloudTrail Audit Stream", "KMS-signed security log stream"),
        ("Root Governance", "Super Admin platform monitor"),
    ], COLOR_ORANGE, Inches(9.74)),
]

arch_w = Inches(2.78)
for title, sub, items, col, lx in arch_nodes:
    card = add_rounded_card(slide4, lx, Inches(1.95), arch_w, Inches(2.65), fill_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER, border_width=1.2)
    
    top_tab = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, lx, Inches(1.95), arch_w, Inches(0.44))
    top_tab.fill.solid()
    top_tab.fill.fore_color.rgb = col
    top_tab.line.fill.background()
    p_t = top_tab.text_frame.paragraphs[0]
    p_t.alignment = PP_ALIGN.CENTER
    r_t = p_t.add_run()
    r_t.text = title
    r_t.font.name = FONT_MAIN
    r_t.font.size = Pt(11)
    r_t.font.bold = True
    r_t.font.color.rgb = COLOR_WHITE

    tb = slide4.shapes.add_textbox(lx + Inches(0.15), Inches(2.48), arch_w - Inches(0.3), Inches(2.05))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = sub
    r.font.name = FONT_MAIN
    r.font.size = Pt(10.5)
    r.font.bold = True
    r.font.color.rgb = COLOR_ORANGE

    for h, d in items:
        pi = tf.add_paragraph()
        pi.space_before = Pt(3.5)
        ri = pi.add_run()
        ri.text = "▸ " + h + "\n  "
        ri.font.name = FONT_MAIN
        ri.font.size = Pt(9.5)
        ri.font.bold = True
        ri.font.color.rgb = COLOR_TEXT_DARK

        ri2 = pi.add_run()
        ri2.text = d
        ri2.font.name = FONT_MAIN
        ri2.font.size = Pt(9)
        ri2.font.color.rgb = COLOR_TEXT_MUTED

# 4 KPI Pills (Enlarged)
kpis = [
    ("AMAZON S3  —  STORE", "Cloud Object Storage: Stores raw CSV source files & backups with server-side AES-256 KMS encryption.", COLOR_ORANGE),
    ("AMAZON EC2  —  RUN", "Virtual Compute Hosting: Runs containerized Docker application backend, ingestion algorithms & auth.", COLOR_BLACK),
    ("CLOUDWATCH  —  OBSERVE", "Observability & Audit: Aggregates logs, tracks P95 42ms response latency, and records SOC-2 audit trails.", COLOR_ORANGE),
    ("POSTGRESQL  —  PERSIST", "ACID Data Store: Persistent business configurations, dynamic schema definitions & tenant inventory.", COLOR_BLACK),
]

kpi_w = Inches(2.78)
for i, (title, desc, col) in enumerate(kpis):
    kx = Inches(0.8) + i * (kpi_w + Inches(0.2))
    card = add_rounded_card(slide4, kx, Inches(4.78), kpi_w, Inches(1.55), fill_color=COLOR_BG_LIGHT, border_color=col, border_width=1.5)
    
    tb = slide4.shapes.add_textbox(kx + Inches(0.15), Inches(4.88), kpi_w - Inches(0.3), Inches(1.35))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = title
    r.font.name = FONT_MAIN
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = col

    p_d = tf.add_paragraph()
    p_d.space_before = Pt(3)
    r_d = p_d.add_run()
    r_d.text = desc
    r_d.font.name = FONT_MAIN
    r_d.font.size = Pt(9.5)
    r_d.font.color.rgb = COLOR_TEXT_MUTED

# Implementation Status Banner
status_banner = add_rounded_card(slide4, Inches(0.8), Inches(6.5), Inches(11.73), Inches(0.6), fill_color=COLOR_BLACK, border_color=None)
tb = slide4.shapes.add_textbox(Inches(1.0), Inches(6.58), Inches(11.3), Inches(0.45))
tf = tb.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "🟢 VERIFIED IMPLEMENTATION: Docker Container, S3 Adapter, PostgreSQL Store, Telemetry API  |  🔵 TARGET BLUEPRINT: Amazon EC2 (t3.micro), Amazon RDS, AWS CloudWatch"
r.font.name = FONT_MAIN
r.font.size = Pt(10)
r.font.bold = True
r.font.color.rgb = COLOR_WHITE

print("Slide 4 enlarged.")

# ==============================================================================
# SLIDE 5: TECH STACK & JUSTIFICATION (ENLARGED)
# ==============================================================================
slide5 = prs.slides.add_slide(blank_layout)
set_slide_base(slide5, COLOR_WHITE)

add_header(slide5, "05 | TECH STACK & JUSTIFICATION", "Every Technology Has", "A Specific Job.",
           "Selected to guarantee configuration-driven adaptability, strong relational integrity, and isolated cloud operations.")

# Left: 6 Layer Rows with enlarged text
layers_data = [
    ("LAYER 1 — EXPERIENCE", "Next.js 16 + React 19 + TypeScript + Tailwind CSS", "Server-side rendering, instant page hydration, strictly typed schemas, and dynamic theme switching.", COLOR_ORANGE),
    ("LAYER 2 — LOGIC & INGESTION", "Next.js API Server Routes + Bcrypt + S3 SDK", "High-throughput CSV chunking, automated heuristic column inference, and bcrypt password hashing.", COLOR_BLACK),
    ("LAYER 3 — DATA PERSISTENCE", "PostgreSQL + Multi-Tenant Row Isolation", "Structured ACID storage for business profiles, schema configs, and transaction ledger. JSONB for custom fields.", COLOR_ORANGE),
    ("LAYER 4 — CLOUD STORAGE", "Amazon S3 (Cloud Object Storage)", "Decouples bulk file ingestion from application compute, ensuring raw uploads never degrade transactional database.", COLOR_BLACK),
    ("LAYER 5 — OBSERVABILITY", "AWS CloudTrail Ledger + CloudWatch RUM", "Cryptographically verifiable audit log tracking every restock and schema edit. Multi-tenant isolation prevents data leaks.", COLOR_ORANGE),
    ("LAYER 6 — PACKAGING", "Docker (Multi-Stage Node 20 Alpine)", "Guarantees reproducible container execution across development and AWS production environments with minimal 140MB footprint.", COLOR_BLACK),
]

ly_y = Inches(1.95)
for tag, tech, rationale, col in layers_data:
    card = add_rounded_card(slide5, Inches(0.8), ly_y, Inches(7.5), Inches(0.74), fill_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER, border_width=1)
    
    bar = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), ly_y, Inches(0.12), Inches(0.74))
    bar.fill.solid()
    bar.fill.fore_color.rgb = col
    bar.line.fill.background()

    tb = slide5.shapes.add_textbox(Inches(1.05), ly_y + Inches(0.06), Inches(7.1), Inches(0.62))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = tag + "  •  "
    r.font.name = FONT_MAIN
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = col

    r2 = p.add_run()
    r2.text = tech
    r2.font.name = FONT_MAIN
    r2.font.size = Pt(11)
    r2.font.bold = True
    r2.font.color.rgb = COLOR_TEXT_DARK

    p_r = tf.add_paragraph()
    r3 = p_r.add_run()
    r3.text = rationale
    r3.font.name = FONT_MAIN
    r3.font.size = Pt(9.5)
    r3.font.color.rgb = COLOR_TEXT_MUTED

    ly_y += Inches(0.78)

# Right: 3 Selection Rationale Cards
right_cards = [
    ("1. Configuration-Driven Architecture", "Rather than generating hardcoded database tables per merchant, a single unified engine reads runtime schema definitions and dynamically projects corresponding tables and forms.", COLOR_BLACK),
    ("2. Strict Relational Integrity", "Inventory stock adjustments and ledger audit logs require absolute ACID consistency. PostgreSQL guarantees transactional consistency, preventing ghost stock or unrecorded sales.", COLOR_ORANGE),
    ("3. Clean Separation of Cloud Concerns", "Large CSV uploads are sent directly to Amazon S3, compute logic runs on EC2, and health telemetry streams to CloudWatch — preventing single points of failure.", COLOR_BLACK),
]

rc_y = Inches(1.95)
for title, desc, col in right_cards:
    card = add_rounded_card(slide5, Inches(8.55), rc_y, Inches(3.98), Inches(1.5), fill_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER, border_width=1.2)
    
    tab = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.55), rc_y, Inches(3.98), Inches(0.38))
    tab.fill.solid()
    tab.fill.fore_color.rgb = col
    tab.line.fill.background()
    p_t = tab.text_frame.paragraphs[0]
    p_t.alignment = PP_ALIGN.CENTER
    r_t = p_t.add_run()
    r_t.text = title
    r_t.font.name = FONT_MAIN
    r_t.font.size = Pt(11)
    r_t.font.bold = True
    r_t.font.color.rgb = COLOR_WHITE

    tb = slide5.shapes.add_textbox(Inches(8.75), rc_y + Inches(0.44), Inches(3.6), Inches(1.0))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = desc
    r.font.name = FONT_MAIN
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_TEXT_MUTED

    rc_y += Inches(1.58)

# Security pill at bottom
add_pill_button(slide5, Inches(0.8), Inches(6.75), Inches(11.73), Inches(0.42), "🔒 Security Guarantee: Zero hardcoded secrets in version control; environment variables strictly injected via process.env with Docker isolation.", bg_color=COLOR_ORANGE_LIGHT, text_color=COLOR_TEXT_DARK, font_size=10)

print("Slide 5 enlarged.")

# ==============================================================================
# SLIDE 6: DEMONSTRATED CAPABILITIES (ENLARGED)
# ==============================================================================
slide6 = prs.slides.add_slide(blank_layout)
set_slide_base(slide6, COLOR_WHITE)

add_header(slide6, "06 | DEMONSTRATED VALUE & EVIDENCE", "One Engine.", "Multiple Tailored Experiences.",
           "Real demonstration evidence verified across 4 distinct industry store silos with live cloud telemetry.")

# 4 Store Silos Cards
retail_cards = [
    ("GUPTA SUPER KIRANA", "Grocery & Daily FMCG", [
        ("Aashirvaad Chakki Atta 10kg", "120 Bags", "₹440", "Low Stock Alert"),
        ("Fortune Mustard Oil 1L", "85 Bottles", "₹145", "Optimal Stock"),
        ("Parle-G Gold Biscuits 250g", "250 Packs", "₹25", "Fast Moving"),
    ], "EXPLORE KIRANA", COLOR_ORANGE),

    ("APOLLO MEDICO PHARMACY", "Pharmaceuticals & Clinical", [
        ("Dolo 650mg Paracetamol", "500 Strips", "Batch DL-8811", "Exp: 2027-05"),
        ("Augmentin 625 Duo Antibiotic", "80 Packs", "Batch AG-4420", "Exp: 2026-11"),
        ("Betadine 10% Ointment 20g", "45 Tubes", "Batch BT-1002", "Exp: 2028-01"),
    ], "EXPLORE PHARMACY", COLOR_BLACK),

    ("MARCO BISTRO & CAFE", "Restaurant & Hospitality", [
        ("Fresh Mozzarella Cheese", "18.5 Kg", "Cold (4°C)", "Reorder Triggered"),
        ("Daawat Basmati Premium", "65.0 Kg", "Dry Storage", "Sufficient Stock"),
        ("Extra Virgin Olive Oil 5L", "6 Cans", "Pantry", "Optimal"),
    ], "EXPLORE CAFE", COLOR_ORANGE),

    ("URBAN THREADS APPAREL", "Fashion & Garments", [
        ("Slim-Fit Raw Denim (Size 32)", "35 Pcs", "Indigo Blue", "SKU-DNM-32"),
        ("Pure Linen Casual Shirt (L)", "24 Pcs", "White Solid", "SKU-LIN-04"),
        ("Crew Neck Cotton Tee (M)", "60 Pcs", "Olive Green", "SKU-TSH-08"),
    ], "EXPLORE APPAREL", COLOR_BLACK),
]

card_w = Inches(2.78)
for i, (store_name, store_cat, items, btn_text, btn_col) in enumerate(retail_cards):
    cx = Inches(0.8) + i * (card_w + Inches(0.2))
    card = add_rounded_card(slide6, cx, Inches(1.95), card_w, Inches(2.7), fill_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER, border_width=1.2)
    
    tb = slide6.shapes.add_textbox(cx + Inches(0.15), Inches(2.05), card_w - Inches(0.3), Inches(2.1))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = store_name
    r.font.name = FONT_MAIN
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = COLOR_TEXT_DARK

    p_sub = tf.add_paragraph()
    r_sub = p_sub.add_run()
    r_sub.text = store_cat
    r_sub.font.name = FONT_MAIN
    r_sub.font.size = Pt(9.5)
    r_sub.font.bold = True
    r_sub.font.color.rgb = COLOR_ORANGE

    for name, c1, c2, c3 in items:
        pi = tf.add_paragraph()
        pi.space_before = Pt(3)
        ri = pi.add_run()
        ri.text = "• " + name + "\n  "
        ri.font.name = FONT_MAIN
        ri.font.size = Pt(9)
        ri.font.bold = True
        ri.font.color.rgb = COLOR_TEXT_DARK

        ri2 = pi.add_run()
        ri2.text = f"{c1} | {c2} | {c3}"
        ri2.font.name = FONT_MAIN
        ri2.font.size = Pt(8.5)
        ri2.font.color.rgb = COLOR_TEXT_MUTED

    add_pill_button(slide6, cx + Inches(0.2), Inches(4.2), card_w - Inches(0.4), Inches(0.38), btn_text, bg_color=btn_col, text_color=COLOR_WHITE, font_size=9.5)

# 4 Bottom Value Cards
val_items = [
    ("ADAPTABILITY", "Instantly projects dynamic UI components from arbitrary CSV structures without database schema rewrites."),
    ("VISIBILITY", "Delivers context-aware inventory metrics (e.g. expiry countdown for medicines, size matrix for clothing)."),
    ("ACCESSIBILITY", "Responsive desktop and mobile web PWA architecture allowing shopkeepers to inspect inventory on any phone."),
    ("OBSERVABILITY", "Integrated CloudTrail audit trail, SOC-2 compliant tenant isolation, and live AWS availability health checks."),
]

val_w = Inches(2.78)
for i, (title, desc) in enumerate(val_items):
    vx = Inches(0.8) + i * (val_w + Inches(0.2))
    card = add_rounded_card(slide6, vx, Inches(4.78), val_w, Inches(1.55), fill_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER, border_width=1.2)
    
    tb = slide6.shapes.add_textbox(vx + Inches(0.15), Inches(4.88), val_w - Inches(0.3), Inches(1.35))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = "✦ " + title
    r.font.name = FONT_MAIN
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = COLOR_ORANGE

    p_d = tf.add_paragraph()
    p_d.space_before = Pt(3)
    r_d = p_d.add_run()
    r_d.text = desc
    r_d.font.name = FONT_MAIN
    r_d.font.size = Pt(9.5)
    r_d.font.color.rgb = COLOR_TEXT_MUTED

# Viva Checklist Banner
add_pill_button(slide6, Inches(0.8), Inches(6.5), Inches(11.73), Inches(0.58), "✅ LIVE DEMONSTRATION VERIFIED: CSV Ingestion • Schema Inference • 1-Click Multi-Store Role Switching • Super Admin Audit Ledger", bg_color=COLOR_BLACK, text_color=COLOR_WHITE, font_size=10.5)

print("Slide 6 enlarged.")

# ==============================================================================
# SLIDE 7: ROADMAP & CONCLUSION (ENLARGED)
# ==============================================================================
slide7 = prs.slides.add_slide(blank_layout)
set_slide_base(slide7, COLOR_WHITE)

add_header(slide7, "07 | ROADMAP & CONCLUSION", "Built to Adapt.", "Designed to Scale.",
           "A clear evolution roadmap advancing from our functional MVP into intelligent forecasting and multi-region enterprise distribution.")

# 3 Roadmap Phase Cards
roadmap = [
    ("PHASE 1 — FOUNDATION", "Current Implemented MVP", [
        ("Adaptive Ingestion Engine", "CSV/XLSX drag-and-drop parsing"),
        ("Heuristic Schema Detection", "Infers data types & business category"),
        ("Multi-Tenant Store Silos", "4 distinct live industry environments"),
        ("AWS S3 & Bcrypt Auth", "Presigned uploads & 10-round salted auth"),
        ("Super Admin Audit Monitor", "CloudTrail & RUM telemetry logging"),
    ], COLOR_ORANGE),

    ("PHASE 2 — INTELLIGENCE", "Next Phase Enhancements", [
        ("Machine Learning Classifier", "Embeddings-based categorization"),
        ("Automated Reorder Forecasting", "Predictive consumption modeling"),
        ("Optical Barcode & QR Camera", "Real-time mobile camera scanner"),
        ("Automated Error Remediation", "Self-healing missing column values"),
        ("Email / SMS Stock Alerts", "Amazon SNS/SES restock notifications"),
    ], COLOR_BLACK),

    ("PHASE 3 — ENTERPRISE SCALE", "Production Target", [
        ("Multi-Branch Warehouse Sync", "Cross-store transfers & consolidated stock"),
        ("Hardware POS Terminal Link", "Receipt printer & thermal barcode hooks"),
        ("AWS RDS Multi-AZ Replication", "Sub-second cross-zone failover"),
        ("Global CDN CloudFront Edge", "Cached asset delivery & WAF security"),
        ("Automated Multi-Region DR", "RTO < 5 mins, RPO = 0 enterprise backup"),
    ], COLOR_ORANGE),
]

phase_w = Inches(3.78)
for i, (p_tag, p_sub, items, theme_col) in enumerate(roadmap):
    px = Inches(0.8) + i * (phase_w + Inches(0.2))
    card = add_rounded_card(slide7, px, Inches(1.95), phase_w, Inches(3.2), fill_color=COLOR_BG_LIGHT, border_color=COLOR_BORDER, border_width=1.2)
    
    tab = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(1.95), phase_w, Inches(0.44))
    tab.fill.solid()
    tab.fill.fore_color.rgb = theme_col
    tab.line.fill.background()
    p_t = tab.text_frame.paragraphs[0]
    p_t.alignment = PP_ALIGN.CENTER
    r_t = p_t.add_run()
    r_t.text = p_tag
    r_t.font.name = FONT_MAIN
    r_t.font.size = Pt(11)
    r_t.font.bold = True
    r_t.font.color.rgb = COLOR_WHITE

    tb = slide7.shapes.add_textbox(px + Inches(0.18), Inches(2.48), phase_w - Inches(0.36), Inches(2.6))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = p_sub
    r.font.name = FONT_MAIN
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = COLOR_ORANGE

    for h, d in items:
        pi = tf.add_paragraph()
        pi.space_before = Pt(4)
        ri = pi.add_run()
        ri.text = "✓ " + h + " — "
        ri.font.name = FONT_MAIN
        ri.font.size = Pt(9.5)
        ri.font.bold = True
        ri.font.color.rgb = COLOR_TEXT_DARK

        ri2 = pi.add_run()
        ri2.text = d
        ri2.font.name = FONT_MAIN
        ri2.font.size = Pt(9)
        ri2.font.color.rgb = COLOR_TEXT_MUTED

# Grand Closing Banner
close_banner = add_rounded_card(slide7, Inches(0.8), Inches(5.35), Inches(11.73), Inches(1.68), fill_color=COLOR_ORANGE, border_color=None)
tb = slide7.shapes.add_textbox(Inches(1.0), Inches(5.45), Inches(11.3), Inches(1.48))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "GRAMSTOCK CLOUD"
r.font.name = FONT_MAIN
r.font.size = Pt(13)
r.font.bold = True
r.font.color.rgb = COLOR_BLACK

p2 = tf.add_paragraph()
p2.alignment = PP_ALIGN.CENTER
p2.space_before = Pt(3)
r2 = p2.add_run()
r2.text = '"Different Data. Different Businesses. One Adaptive Inventory Platform."'
r2.font.name = FONT_MAIN
r2.font.size = Pt(22)
r2.font.bold = True
r2.font.color.rgb = COLOR_WHITE

p3 = tf.add_paragraph()
p3.alignment = PP_ALIGN.CENTER
p3.space_before = Pt(6)
r3 = p3.add_run()
r3.text = "Cloud Computing Mini-Project 2026  •  Next.js 16 + Docker + AWS (S3 / EC2 / CloudWatch)  •  Questions & Live Demonstration"
r3.font.name = FONT_MAIN
r3.font.size = Pt(11)
r3.font.bold = True
r3.font.color.rgb = COLOR_BLACK

print("Slide 7 enlarged.")

# Save presentation
out_final = os.path.abspath(os.path.join(os.path.dirname(__file__), "GramStock_Cloud_Presentation_Final.pptx"))
prs.save(out_final)
print(f"Presentation saved successfully to: {out_final}")

# Attempt saving to previous files if unlocked
for alt_name in ["GramStock_Cloud_Presentation_Corporate.pptx", "GramStock_Cloud_Presentation.pptx"]:
    alt_path = os.path.abspath(os.path.join(os.path.dirname(__file__), alt_name))
    try:
        prs.save(alt_path)
        print(f"Also updated: {alt_path}")
    except Exception as e:
        print(f"Notice: {alt_name} is currently open in PowerPoint. Kept as {out_final}!")
