const express = require('express');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('BAN').select('*').order('MaBan');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.post('/', authMiddleware(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('BAN').insert([req.body]).select();
        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json(data[0]);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.put('/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('BAN').update(req.body).eq('MaBan', req.params.id).select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
    try {
        const { error } = await supabase.from('BAN').delete().eq('MaBan', req.params.id);
        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: 'Đã xóa' });
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

router.patch('/:id/status', authMiddleware(['admin', 'phucvu']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('BAN').update({ TrangThai: req.body.TrangThai }).eq('MaBan', req.params.id).select();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data[0]);
    } catch (err) { res.status(500).json({ error: 'Lỗi server' }); }
});

module.exports = router;
