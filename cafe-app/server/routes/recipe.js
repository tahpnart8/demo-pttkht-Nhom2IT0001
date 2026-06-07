const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/recipe/:maMon
router.get('/:maMon', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('CONGTHUC')
            .select('*, NGUYENLIEU(TenNL, DonViTinh)')
            .eq('MaMon', req.params.maMon);
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/recipe - Add/update mapping
router.post('/', authMiddleware(['admin']), async (req, res) => {
    const { MaMon, mappings } = req.body;
    try {
        await supabase.from('CONGTHUC').delete().eq('MaMon', MaMon);
        const toInsert = mappings.map(m => ({ MaMon, MaNL: m.MaNL, DinhLuong: m.DinhLuong }));
        const { data, error } = await supabase.from('CONGTHUC').insert(toInsert).select();
        
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
