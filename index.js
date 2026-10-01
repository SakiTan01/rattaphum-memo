require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// อนุญาตให้เรียก API จาก GitHub Pages ได้
app.use(cors({
    origin: '*', // หรือใส่เฉพาะโดเมน https://sakitan01.github.io
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// เชื่อมต่อ Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. GET: ดึงรายการทั้งหมด
app.get('/api/requisitions', async (req, res) => {
    const { data, error } = await supabase
        .from('requisitions')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 2. POST: สร้างรายการใหม่
app.post('/api/requisitions', async (req, res) => {
    const { data, error } = await supabase
        .from('requisitions')
        .insert([req.body])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// 3. PUT: แก้ไขข้อมูล / อัปเดตสถานะการอนุมัติ
app.put('/api/requisitions/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('requisitions')
        .update(req.body)
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// 4. DELETE: ลบรายการ
app.delete('/api/requisitions/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('requisitions')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Deleted successfully' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
