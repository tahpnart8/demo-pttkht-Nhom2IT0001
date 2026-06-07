require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const NEW_INGREDIENTS = [
    { MaNL: 'NL07', TenNL: 'Bơ sáp', DonViTinh: 'Kg', SoLuongTon: 10, MucToiThieu: 2 },
    { MaNL: 'NL08', TenNL: 'Dâu tây', DonViTinh: 'Kg', SoLuongTon: 10, MucToiThieu: 2 },
    { MaNL: 'NL09', TenNL: 'Trứng gà', DonViTinh: 'Quả', SoLuongTon: 100, MucToiThieu: 30 },
    { MaNL: 'NL10', TenNL: 'Đường cát', DonViTinh: 'Gram', SoLuongTon: 5000, MucToiThieu: 1000 },
    { MaNL: 'NL11', TenNL: 'Trân châu', DonViTinh: 'Kg', SoLuongTon: 20, MucToiThieu: 5 },
    { MaNL: 'NL12', TenNL: 'Syrup Cam sả', DonViTinh: 'Chai', SoLuongTon: 10, MucToiThieu: 2 },
    { MaNL: 'NL13', TenNL: 'Ly cốc nhựa', DonViTinh: 'Cái', SoLuongTon: 1000, MucToiThieu: 100 }
];

const NEW_RECIPES = [
    // MON01: Cà phê sữa đá
    { MaMon: 'MON01', MaNL: 'NL01', DinhLuong: 20 },   // 20g Cà phê bột
    { MaMon: 'MON01', MaNL: 'NL02', DinhLuong: 0.1 },  // 0.1 lon Sữa đặc
    { MaMon: 'MON01', MaNL: 'NL13', DinhLuong: 1 },    // 1 Ly nhựa
    // MON02: Bạc xỉu
    { MaMon: 'MON02', MaNL: 'NL01', DinhLuong: 10 },   // 10g Cà phê bột
    { MaMon: 'MON02', MaNL: 'NL02', DinhLuong: 0.15 }, // 0.15 lon Sữa đặc
    { MaMon: 'MON02', MaNL: 'NL03', DinhLuong: 0.5 },  // 0.5 hộp sữa tươi
    { MaMon: 'MON02', MaNL: 'NL13', DinhLuong: 1 },
    // MON03: Americano
    { MaMon: 'MON03', MaNL: 'NL01', DinhLuong: 25 },
    { MaMon: 'MON03', MaNL: 'NL10', DinhLuong: 10 },
    { MaMon: 'MON03', MaNL: 'NL13', DinhLuong: 1 },
    // MON04: Latte
    { MaMon: 'MON04', MaNL: 'NL01', DinhLuong: 20 },
    { MaMon: 'MON04', MaNL: 'NL03', DinhLuong: 0.8 },
    { MaMon: 'MON04', MaNL: 'NL13', DinhLuong: 1 },
    // MON05: Trà đào cam sả
    { MaMon: 'MON05', MaNL: 'NL04', DinhLuong: 10 },   // 10g Trà đen
    { MaMon: 'MON05', MaNL: 'NL06', DinhLuong: 0.2 },  // 0.2 lon Đào ngâm
    { MaMon: 'MON05', MaNL: 'NL12', DinhLuong: 0.05 }, // Syrup cam sả
    { MaMon: 'MON05', MaNL: 'NL13', DinhLuong: 1 },
    // MON06: Trà sữa truyền thống
    { MaMon: 'MON06', MaNL: 'NL04', DinhLuong: 15 },
    { MaMon: 'MON06', MaNL: 'NL02', DinhLuong: 0.1 },
    { MaMon: 'MON06', MaNL: 'NL11', DinhLuong: 0.05 }, // Trân châu
    { MaMon: 'MON06', MaNL: 'NL13', DinhLuong: 1 },
    // MON07: Sinh tố bơ
    { MaMon: 'MON07', MaNL: 'NL07', DinhLuong: 0.2 },  // 200g Bơ
    { MaMon: 'MON07', MaNL: 'NL02', DinhLuong: 0.1 },
    { MaMon: 'MON07', MaNL: 'NL03', DinhLuong: 0.5 },
    { MaMon: 'MON07', MaNL: 'NL13', DinhLuong: 1 },
    // MON08: Sinh tố dâu
    { MaMon: 'MON08', MaNL: 'NL08', DinhLuong: 0.15 }, // 150g Dâu
    { MaMon: 'MON08', MaNL: 'NL02', DinhLuong: 0.1 },
    { MaMon: 'MON08', MaNL: 'NL03', DinhLuong: 0.5 },
    { MaMon: 'MON08', MaNL: 'NL13', DinhLuong: 1 },
    // MON09: Nước ép cam
    { MaMon: 'MON09', MaNL: 'NL05', DinhLuong: 0.3 },  // 300g Cam
    { MaMon: 'MON09', MaNL: 'NL10', DinhLuong: 20 },
    { MaMon: 'MON09', MaNL: 'NL13', DinhLuong: 1 },
    // MON10: Bánh flan
    { MaMon: 'MON10', MaNL: 'NL09', DinhLuong: 1 },    // 1 Quả trứng
    { MaMon: 'MON10', MaNL: 'NL03', DinhLuong: 0.2 },
    { MaMon: 'MON10', MaNL: 'NL10', DinhLuong: 15 }
];

async function run() {
    console.log('Đang kết nối Supabase...');
    
    // 1. Thêm nguyên liệu mới (Bỏ qua nếu đã tồn tại)
    console.log('Thêm các nguyên liệu còn thiếu...');
    for (const nl of NEW_INGREDIENTS) {
        const { data } = await supabase.from('NGUYENLIEU').select('MaNL').eq('MaNL', nl.MaNL);
        if (!data || data.length === 0) {
            await supabase.from('NGUYENLIEU').insert(nl);
        }
    }

    // 2. Xóa toàn bộ công thức cũ
    console.log('Xóa công thức cũ...');
    await supabase.from('CONGTHUC').delete().neq('MaMon', 'dummy');

    // 3. Thêm công thức mới cho 10 món
    console.log('Thêm công thức chuẩn cho 10 món...');
    const { error } = await supabase.from('CONGTHUC').insert(NEW_RECIPES);
    
    if (error) console.error('Lỗi khi thêm công thức:', error);
    else console.log('Hoàn thành! Bạn đã có 100% công thức siêu chi tiết.');
}

run();
