#!/bin/bash

# DailyMotiv - Quick Start Setup
# This script sets up auth and local dev helpers

set -e

echo "🚀 DailyMotiv - Quick Start Setup"
echo "=================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js @supabase/ssr --silent
echo "✅ Dependencies installed"
echo ""

# Templates and seeding are deprecated for DailyMotiv — skip placeholder generation.
echo "🎵 Template seeding skipped for DailyMotiv — place demo audio in public/demo-nudges/"
echo ""

# Step 2: Summary
echo "✨ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Replace placeholder MP3 files in public/demo-nudges/ with real audio"
echo "   2. Run: npm run dev"
echo "   3. Visit: http://localhost:5000/pricing"
echo "   4. Click 'Subscribe' to test auth + checkout flow"
echo ""
echo "📚 Documentation:"
echo "   - IMPLEMENTATION.md  - Complete setup guide"
echo "   - DEEP_DIVE.md       - Architecture overview"
echo ""
echo "🔧 Useful Commands:"
echo "   npm run dev                    - Start dev server"
echo "   # Templates are deprecated; use public/demo-nudges/ for demo audio"
echo ""
echo "💬 To get help:"
echo "   - Check IMPLEMENTATION.md section 9 (Troubleshooting)"
echo ""
