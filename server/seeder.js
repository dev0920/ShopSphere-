import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";

dotenv.config();

// ── VENDORS LIST ──────────────────────────────────────
const VENDORS = [
  { name: "Kashi Silk & Handloom", email: "vendor1@kashisilk.com" },
  { name: "Urban Chic Apparel", email: "vendor2@urbanchic.com" },
  { name: "Royal Men's Hub", email: "vendor3@royalmens.com" },
  { name: "StepRight Footwear", email: "vendor4@stepright.com" },
  { name: "TechGalaxy Electronics", email: "vendor5@techgalaxy.com" },
];

// ── ALL CATEGORIES & SUBCATEGORIES (1 SAMPLE PRODUCT EACH) ──
const SAMPLE_PRODUCTS = [
  // ── 1. ETHNIC WEAR (Vendor 0: Kashi Silk & Handloom) ──
  {
    category: "Ethnic Wear", subCategory: "Sarees", vendorIdx: 0,
    name: "Banarasi Pure Silk Saree", brand: "Kashi Weaves", price: 2499, oldPrice: 4999,
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    desc: "Handcrafted pure Banarasi silk saree with gold zari weave."
  },
  {
    category: "Ethnic Wear", subCategory: "Kurtis", vendorIdx: 0,
    name: "Floral Georgette Anarkali Kurti", brand: "Jaipur Fab", price: 899, oldPrice: 1799,
    img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSrXOojFXqB4NOCcEIGjv84Wq96N9qKOupKiDTbDuyivgdruO2d2MRtoyFk8hnqsl-c9B4ChrEjiQZY-H6DJk4xSyh7tCFbB3sz_1yK2IKAJpAtyUKm2kIIqA",
    desc: "Flared Georgette Anarkali kurti with floral print."
  },
  {
    category: "Ethnic Wear", subCategory: "Kurti Sets", vendorIdx: 0,
    name: "Art Silk Kurti & Pant Set", brand: "Kashi Weaves", price: 1499, oldPrice: 2999,
    img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT-X52RpBXSOQfkHXoX4r1nIl0Ansf2RCqJFT6TX1aYV20Q3AAA7aZfp-KyEIZISt_uJj0xFZcKVOLMKHKbA3vEEDLBMPFlU1Lvb2jCqbeaINbOPJiDL9zPbA",
    desc: "2-piece silk straight kurti and trouser set."
  },
  {
    category: "Ethnic Wear", subCategory: "Lehengas", vendorIdx: 0,
    name: "Heavy Bridal Velvet Lehenga", brand: "Rajwada Bridal", price: 4999, oldPrice: 9999,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvcD9c7eg-J47a0DzxFrMk2g1C9ag2rVzIhfDokxAPuw&s=10",
    desc: "Heavy velvet bridal lehenga set with dupatta."
  },
  {
    category: "Ethnic Wear", subCategory: "Suit Sets", vendorIdx: 0,
    name: "Phulkari Punjabi Salwar Suit Set", brand: "Bengal Handloom", price: 1299, oldPrice: 2599,
    img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS6ZYcG3dbobHGNcnwFq3hPEa43UmwGP7XVDmJethrpaNNcIrAJwMjFS2j1kxiVxVeCSbvzCO95uDzXn1ReAn-1aKDAIg4UUg",
    desc: "Traditional Punjabi suit set with Phulkari embroidery."
  },
  {
    category: "Ethnic Wear", subCategory: "Dupatta Sets", vendorIdx: 0,
    name: "Cotton Kurti Pant & Bandhani Dupatta Set", brand: "Kashi Weaves", price: 1399, oldPrice: 2799,
    img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRqOeuzCERIawOBZN8kqtir1SZNjADaRWLORCxdpyb-_Pyk6tlh4UaT0g1cdrlHcUUu_-NR7dja-OeOmsxPXNKS8ixCqaHjFD23CJjn-y5NbWfDH7eAUX_N5A",
    desc: "Cotton kurti pant set with tie-dye Bandhani silk dupatta."
  },

  // ── 2. WESTERN DRESSES (Vendor 1: Urban Chic Apparel) ──
  {
    category: "Western Dresses", subCategory: "Midi Dresses", vendorIdx: 1,
    name: "Floral Wrap Chiffon Midi Dress", brand: "Zara Style", price: 999, oldPrice: 1999,
    img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQbzTgHfgbb7_C6ETwUD08HuR24BDnGc5OLChdI4MqWSv_C6yYLN7mj_RjihF5Lk0pYHQSVDN1mtd8wWvpxi_-HLLmHTzYn53e1a01WgPk",
    desc: "Floral printed wrap midi dress with V-neckline."
  },
  {
    category: "Western Dresses", subCategory: "Party Dresses", vendorIdx: 1,
    name: "Strapless Satin Party Dress", brand: "Club Chic", price: 1299, oldPrice: 2599,
    img: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRgy3tEiOzrr81uNkYYGmYgmxU0Uq2Xi_XUWm1ows35Wb2ECipiUNcMSBkZbnSTvsPeR8N5cJYaLX1kflz1NYe_2_Nk9YNxT-PNRNDl53aTzpfN8WoyjqtnCkI",
    desc: "Bodycon strapless evening satin party dress."
  },
  {
    category: "Western Dresses", subCategory: "Maxi Dresses", vendorIdx: 1,
    name: "Off-Shoulder Boho Chiffon Maxi Dress", brand: "Free Spirit", price: 1199, oldPrice: 2399,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRWkRC2JjOmmaP2Eul6I7UNtuTciCHPWkBGuLkkaNpMpyvpv8xlPMsqS2TiBx--KYKTOBib-bDwfvc1Iitd1N40ZDXlalnqktsj9-RuIKEtoLDnBH9VtNwu9J4",
    desc: "Boho off-shoulder maxi dress with smocked waist."
  },
  {
    category: "Western Dresses", subCategory: "Shirt Dresses", vendorIdx: 1,
    name: "Cotton Button Down Shirt Dress", brand: "Urban Chic", price: 899, oldPrice: 1799,
    img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQP9pwMkHd_jpnn5HMc2HKlruqedtyrGPR7XrWy1MwR-EPYrPd1WuDEx1ewVi-mzItqa4rafl-IYsG1bBurm7N9UxvAcjcVVRI2DDF53I65Ymct556hC3deGA",
    desc: "Casual button down cotton shirt dress with belt."
  },
  {
    category: "Western Dresses", subCategory: "Casual Dresses", vendorIdx: 1,
    name: "A-Line Summer Cotton Dress", brand: "Mango Style", price: 799, oldPrice: 1599,
    img: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQvZGLAeS-U2n1bKwAVarhhEKAxQtFpGIT4gWmHdLuKGzX8P0Ys_h1yXECUNmWMdovkvwaej3NQ_WuV63nW8CnVadPKRyWtAXFttKYmdKsPE0awTcyDrekrFA",
    desc: "Breezy daily casual summer cotton dress."
  },
  {
    category: "Western Dresses", subCategory: "Mini Dresses", vendorIdx: 1,
    name: "Ribbed Bodycon Mini Dress", brand: "Forever 21", price: 699, oldPrice: 1399,
    img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQhzRMr1hIkFKqq1yaRq9WJ_qyAYKsJ42idekLhSks22_T3GyWJ1KBZC5bLnZSiYrkEhMJZVLOAvTQ98Hg5yMcbgzPRiFi9Bhx5MvMhuNh9dn_3pL2_INIG0g",
    desc: "Stretch ribbed knit sleeveless mini dress."
  },
  {
    category: "Western Dresses", subCategory: "Jumpsuits", vendorIdx: 1,
    name: "Wide Leg Belted Linen Jumpsuit", brand: "Zara Style", price: 1399, oldPrice: 2799,
    img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTVYhXueSOCUQyTJZrYmEeAOPi4tyuDbrdJutMyd3dHTW7KSu2EfbdDrNXcZ5YeXEZqSfL42zkN0KMkrgoarH20tDyNj7zwnHlc98jT5Rs",
    desc: "Sophisticated wide-leg linen jumpsuit with waist belt."
  },
  {
    category: "Western Dresses", subCategory: "Co-ord Sets", vendorIdx: 1,
    name: "Printed Crop Top & Skirt Co-ord Set", brand: "Urban Chic", price: 1199, oldPrice: 2399,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTMs3D50hlWVDlkaXPCqBGI6bxO0O99NQpQuA4Mz2zrKtFUgvD0ZBcVqe0eWu0UIirbTdg-8RNG7ssawnEe4CMoHKeuFxFhAMnhMLC-CkMWzOrCoKqO_eolt7g",
    desc: "Matching 2-piece printed crop top and midi skirt."
  },

  // ── 3. MENSWEAR (Vendor 2: Royal Men's Hub) ──
  {
    category: "Menswear", subCategory: "Formal Shirts", vendorIdx: 2,
    name: "Slim Fit Oxford Formal Shirt", brand: "Peter England", price: 799, oldPrice: 1599,
    img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ4U1kUX2vlIs4BGqLH0YDqUF5NtS6esljQVjF7LSEGCletki7gW3Z5RvzhEhHIeTYFcq8lyiAaOWbe1QxyGC0tUml2YhtraTIQIv_g2uYHAx3Afan59L5m0w",
    desc: "100% Oxford cotton formal button-down shirt."
  },
  {
    category: "Menswear", subCategory: "Casual Shirts", vendorIdx: 2,
    name: "Linen Printed Casual Shirt", brand: "Arrow", price: 699, oldPrice: 1399,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSESfnyQH5cRHRaIFYO07jKTkBwyGC1_-lIORQIghzO3oOG6lNquWoS1PdT6k_OdalE_bAzXu-l0pO7MzhUYnF6UTjzY2xFksHQ6aBaowlGRPMTegZwqSVq5w",
    desc: "Breathable linen casual short sleeve printed shirt."
  },
  {
    category: "Menswear", subCategory: "Jeans", vendorIdx: 2,
    name: "Slim Fit Dark Wash Denim Jeans", brand: "Levi's Style", price: 1199, oldPrice: 2399,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQgQdgB6FWa6nzQAe5S0IbSXfUlI13RFqpAHoicUmSEWelkAjtuFuSImHFoNtkPizXYKb4rQ_dUF688ZyK0pgZnYyK2Wj-QgOVEQczfrTTIBuC_CqQfS__s",
    desc: "Stretch denim dark wash slim leg jeans."
  },
  {
    category: "Menswear", subCategory: "Trousers", vendorIdx: 2,
    name: "Slim Fit Chino Formal Trousers", brand: "Dockers", price: 999, oldPrice: 1999,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQgQdgB6FWa6nzQAe5S0IbSXfUlI13RFqpAHoicUmSEWelkAjtuFuSImHFoNtkPizXYKb4rQ_dUF688ZyK0pgZnYyK2Wj-QgOVEQczfrTTIBuC_CqQfS__s",
    desc: "Flat-front cotton stretch formal chino trousers."
  },
  {
    category: "Menswear", subCategory: "T-Shirts", vendorIdx: 2,
    name: "Pique Cotton Navy Polo T-Shirt", brand: "Lacoste Style", price: 599, oldPrice: 1199,
    img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRlElqEQi2bBDPHlS3TOFFudHCo37HBWREvLhmoymcRNaslhl1GEwShHYXUdAGEndu5BLTj6cfDLJNlgfRYLMpydgGJkXeCi4sWsUIw5kk",
    desc: "Classic pique cotton polo t-shirt with ribbed collar."
  },
  {
    category: "Menswear", subCategory: "Ethnic Kurta", vendorIdx: 2,
    name: "Cotton Silk Jacquard Short Kurta", brand: "Manyavar Style", price: 899, oldPrice: 1799,
    img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTP45b1lkrep-nXIZN9kXDv8A5L70LAt62V3dUeOag0s9YNevI1pkURGskyoi9WtIWqnji0rMkei8GY7__C9zilKoGrw97RludsiVChEiw0q90sYkp623K8",
    desc: "Men's festive jacquard print short kurta."
  },
  {
    category: "Menswear", subCategory: "Sweatshirts", vendorIdx: 2,
    name: "Fleece Hooded Casual Sweatshirt", brand: "HRX Style", price: 799, oldPrice: 1599,
    img: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRKolA5ek2JUFUFQAmyqNzW5o_2Nco_E1Bk41qjbelWNvxapbfMiTvKrt26qLZCb8GFDEc-cBybyhsqRSU4IkTRlJYl2DmFyyyRY2N9WMk",
    desc: "Warm fleece drawstring hooded sweatshirt."
  },
  {
    category: "Menswear", subCategory: "Blazers", vendorIdx: 2,
    name: "Checked Wool Blend Slim Blazer", brand: "Raymond Style", price: 2499, oldPrice: 4999,
    img: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTBwffk61RcuslmkcVyX_tYTcitj7C1kTX9N1L38md_GmtTKeyKgfryIU0vTh02UO9RRbCktHrTzzGCpoWs1g6JFozwq5gcgOgndNSCjZ7e0r566GvAahlrhLM",
    desc: "Tailored checked wool blend formal blazer."
  },
  {
    category: "Menswear", subCategory: "Jackets", vendorIdx: 2,
    name: "Distressed Biker Denim Jacket", brand: "Roadster", price: 1499, oldPrice: 2999,
    img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSWtTsb0LZ8nd23ePzdgkvzi1chllXv__kx0fG9btMkKtL8Yy_IEeBn4GHfUgy8IWN0edZwfKA9kJguLpbhkOBIPVK6iMxp2CsWYR55jGBr7TUHuiZJQ6Ta",
    desc: "Classic button-up denim biker jacket."
  },
  {
    category: "Menswear", subCategory: "Sherwani", vendorIdx: 2,
    name: "Silk Indo-Western Wedding Sherwani Set", brand: "Manyavar", price: 4999, oldPrice: 9999,
    img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQPAlp0K84IteAtpHVxTBI1XOqVug7QGYXR3llIn7FFO3MHZvX_ZQQu382QSvHIx_DJeIgyshS_4FMgF2xK6wkBeJ-VwM-nJA3mgR9_5tLNToXuJLrldes-0ss",
    desc: "Heavy embroidered silk wedding sherwani with churidar."
  },

  // ── 4. FOOTWEAR (Vendor 3: StepRight Footwear) ──
  {
    category: "Footwear", subCategory: "Sports Shoes", vendorIdx: 3,
    name: "Mesh Athletic Running Shoes", brand: "Nike Style", price: 1499, oldPrice: 2999,
    img: "https://images.meesho.com/images/products/444955635/dzofw_512.avif?width=512",
    desc: "Lightweight mesh running shoes with rubber sole."
  },
  {
    category: "Footwear", subCategory: "Heels", vendorIdx: 3,
    name: "Tan Synthetic Leather Block Heels", brand: "Catwalk", price: 999, oldPrice: 1999,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTKjR5M8wp_lZWNX7WPwFwSt4BqfoQrdk67wgIeLfgnr_jeTEnOlCK2tog7amaFmlCDGipS08x6LGSJvzBnV5grEgU8lfSW9uLU1c0rDM7Zv0atg-Q8RmgCZ6c",
    desc: "2.5-inch block heel sandals with cushioned sole."
  },
  {
    category: "Footwear", subCategory: "Formal Shoes", vendorIdx: 3,
    name: "Black Genuine Leather Oxford Shoes", brand: "Red Tape", price: 1799, oldPrice: 3599,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSr47zzgp25GeyntVR-QlZ-4iu3hRexMXRSQpSpuQkFtOc3AJLWNamgACO997gvX1nif-OQ_uPv1M59421EHrCYhPVwnH-Jrg",
    desc: "Lace-up genuine leather Oxford formal shoes."
  },
  {
    category: "Footwear", subCategory: "Ethnic Footwear", vendorIdx: 3,
    name: "Handcrafted Jutti Mojari Sandals", brand: "Rajasthani Crafts", price: 699, oldPrice: 1399,
    img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRmpnQHDpE2YvnoMplWQLMaGViP6W3qudoiqIJ0lpP05TiM0rpl62hEcjDv9nhknOXhmeLDxlFWn8B4NM7FZMoBktLGjUYe9mRGpf4k10PXbejntd6IUJep",
    desc: "Traditional embroidered Punjabi jutti mojari."
  },
  {
    category: "Footwear", subCategory: "Casual Shoes", vendorIdx: 3,
    name: "White Canvas Lace-up Sneakers", brand: "Puma Style", price: 899, oldPrice: 1799,
    img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTNWxPQVMEd0okq5Z_RzEhB8_Qw6JZRhdt7qD8s3p7lBwigjNTS1ojueoZ1p5U6rDAP5SwYz7wCW6lL8BS2roWUvjZATixKgw",
    desc: "Daily casual white canvas sneakers."
  },
  {
    category: "Footwear", subCategory: "Flats", vendorIdx: 3,
    name: "Strappy Synthetic Leather Flat Sandals", brand: "Bata", price: 499, oldPrice: 999,
    img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQZjnmiOAbJSBrWdbGBZnGxvC9OgClzJTnwDPK7Jnom2Nc_ky8azv5tYjKYbJ57E6fvcH5BYyBFH3vqbvl1G3U4OBlwsBw0LVuRNXZNJFgw",
    desc: "Open toe comfortable daily flat sandals."
  },
  {
    category: "Footwear", subCategory: "Boots", vendorIdx: 3,
    name: "Ankle Length Leather Chelsea Boots", brand: "Woodland Style", price: 2199, oldPrice: 4399,
    img: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTxq-YEPUx2pM2uu1byo6CcsX8h4f06momXTxbMbpYLQMf8q2hfCaChMS60gCV0XMLVfkKSNmMCIH-zp_mnQ6uJ2Kojf2beiUZS7_P5dl3VizLTCZwoRR4FVA",
    desc: "Rugged genuine leather Chelsea ankle boots."
  },

  // ── 5. HOME DECOR (Vendor 4: TechGalaxy Electronics / Decor) ──
  {
    category: "Home Decor", subCategory: "Wall Decor", vendorIdx: 4,
    name: "Macrame Boho Wall Hanging Tapestry", brand: "Artisan Home", price: 799, oldPrice: 1599,
    img: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQDcKa1dkchnCp_E6l1EGcOcDIImOzFyTAArsQk46NiXUKjOWAYlE79quSk2xRpWuT3N_nh8bIl6TB_dgtUJhtsWHx1Pr2fqUWbFU89Qn4",
    desc: "Handmade cotton macrame wall hanging tapestry."
  },
  {
    category: "Home Decor", subCategory: "Cushions & Pillows", vendorIdx: 4,
    name: "Velvet Embroidered Cushion Covers Pack of 2", brand: "Home Centre", price: 499, oldPrice: 999,
    img: "https://cdn.vaaree.com/catalog/assets/ast_7a02ecc8b9d24320b6d79631538ef3c1/variants/product_gallery_640x640_webp.webp",
    desc: "Soft velvet square cushion covers."
  },
  {
    category: "Home Decor", subCategory: "Cookware", vendorIdx: 4,
    name: "Non-Stick Granite Cookware Set 3 Pcs", brand: "Prestige", price: 1499, oldPrice: 2999,
    img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQXErVQP5HDkWRaDXtdphUZODdzqPKyHbEIfGLo72g8WYbjJc2F4CgqbDDTF54ftinfzLg1Pxg0W1u4F_EidL3VXkDZBvvh0w",
    desc: "Induction friendly non-stick granite pan set."
  },
  {
    category: "Home Decor", subCategory: "Bedding", vendorIdx: 4,
    name: "Cotton King Size Double Bedsheet", brand: "Bombay Dyeing", price: 899, oldPrice: 1799,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSrd0atKMps0WB8ZlVw266x09Kdx8u247Z4j465GxDhBsOiGtuSNv7gBG736HEsOjE3U5JUAwGiUL83j0d89MXx46eWbe5ErNXgulh535k",
    desc: "100% cotton double bedsheet with 2 pillow covers."
  },
  {
    category: "Home Decor", subCategory: "Lighting", vendorIdx: 4,
    name: "Nordic Wooden Tripod Floor Lamp", brand: "Decor Studio", price: 1999, oldPrice: 3999,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRo0KIB0qvz6bHAnbcZupws8Po-wO4J_bCzDRpiRSrb-5dCAsW1It3S1ACsDliHN3B9L_k5ksRj-y3rmonmnEzwqwSIETS_g9Sru-vultEe",
    desc: "Modern wooden tripod floor lamp with linen shade."
  },
  {
    category: "Home Decor", subCategory: "Planters", vendorIdx: 4,
    name: "Ceramic Indoor Tabletop Planter Pot", brand: "Gardenia", price: 499, oldPrice: 999,
    img: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRZ6bn7UZWe-JdEvkz82hR3R2H1c8Hd7czdOBbQpV-c9kXNTvFJnBy_knC8ZW9SZqSBpmKAJUuwwkWFTvFHsjYFb6LYHRJm2g2N55OD1Og",
    desc: "Handcrafted ceramic planter pot for indoor succulents and houseplants."
  },
  {
    category: "Home Decor", subCategory: "Rugs & Carpets", vendorIdx: 4,
    name: "Bohemian Woven Area Floor Rug", brand: "Carpeto", price: 1499, oldPrice: 2999,
    img: "https://www.obeetee.in/cdn/shop/files/1_301e5471-b075-4b3d-aeb5-432d488c5315.jpg?v=1756800249&width=1200",
    desc: "Soft woven bohemian geometrical cotton floor area rug."
  },
  {
    category: "Home Decor", subCategory: "Candles & Fragrance", vendorIdx: 4,
    name: "Aromatherapy Scented Soy Wax Candle Jar", brand: "Iris Fragrance", price: 399, oldPrice: 799,
    img: "https://m.media-amazon.com/images/I/81HSydTuXVL.jpg",
    desc: "Organic lavender scented glass jar soy wax candle."
  },
  {
    category: "Home Decor", subCategory: "Storage", vendorIdx: 4,
    name: "Handwoven Cotton Rope Storage Basket", brand: "OrganiseIt", price: 699, oldPrice: 1399,
    img: "https://www.obeetee.in/cdn/shop/files/1_301e5471-b075-4b3d-aeb5-432d488c5315.jpg?v=1756800249&width=1200",
    desc: "Multi-purpose handwoven cotton rope storage basket organizer."
  },

  // ── 6. BEAUTY (Vendor 1: Urban Chic Apparel) ──
  {
    category: "Beauty", subCategory: "Serums", vendorIdx: 1,
    name: "Vitamin C 10% Glow Serum 30ml", brand: "Minimalist", price: 599, oldPrice: 999,
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
    desc: "Vitamin C face serum for glowing radiant skin."
  },
  {
    category: "Beauty", subCategory: "Lip Makeup", vendorIdx: 1,
    name: "Matte Liquid Lipstick Longwear", brand: "Maybelline", price: 399, oldPrice: 699,
    img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
    desc: "16-hour longwear matte liquid lipstick."
  },
  {
    category: "Beauty", subCategory: "Moisturisers", vendorIdx: 1,
    name: "Hyaluronic Acid Oil-Free Gel Moisturiser", brand: "Neutrogena", price: 499, oldPrice: 899,
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
    desc: "Hydrating oil-free water gel moisturizer."
  },

  // ── 7. ELECTRONICS (Vendor 4: TechGalaxy Electronics) ──
  {
    category: "Electronics", subCategory: "Wireless Headphones", vendorIdx: 4,
    name: "Active Noise Cancelling Headphones", brand: "Sony Style", price: 3499, oldPrice: 6999,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    desc: "Over-ear bluetooth headphones with 30-hour playback."
  },
  {
    category: "Electronics", subCategory: "Laptops", vendorIdx: 4,
    name: "Ultra Slim Core i5 Aluminum Laptop", brand: "Asus Style", price: 42999, oldPrice: 59999,
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    desc: "Intel Core i5 laptop with 16GB RAM & 512GB SSD."
  },
  {
    category: "Electronics", subCategory: "Smartwatches", vendorIdx: 4,
    name: "Full Screen Calling Smartwatch SpO2", brand: "Noise Style", price: 2199, oldPrice: 4399,
    img: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
    desc: "Smartwatch with bluetooth calling and health sensors."
  },

  // ── 8. ACCESSORIES (Vendor 1: Urban Chic Apparel) ──
  {
    category: "Accessories", subCategory: "Sunglasses", vendorIdx: 1,
    name: "Polarized Aviator Gold Sunglasses", brand: "Ray-Ban Style", price: 899, oldPrice: 1799,
    img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    desc: "Gold aviator sunglasses with polarized lenses."
  },
  {
    category: "Accessories", subCategory: "Wallets & Belts", vendorIdx: 1,
    name: "Genuine Leather RFID Bifold Wallet", brand: "Wildhorn", price: 599, oldPrice: 1199,
    img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
    desc: "Handcrafted leather bifold wallet with RFID shield."
  },

  // ── 9. GROCERY (Vendor 4: TechGalaxy Electronics / Grocery) ──
  {
    category: "Grocery", subCategory: "Rice & Grains", vendorIdx: 4,
    name: "India Gate Royal Basmati Rice 5kg", brand: "India Gate", price: 549, oldPrice: 799,
    img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
    desc: "Aged long grain premium Basmati rice."
  },

  // ── 10. KIDS & TOYS (Vendor 3: StepRight Footwear / Toys) ──
  {
    category: "Kids & Toys", subCategory: "Educational Toys", vendorIdx: 3,
    name: "Wooden 50-Piece Building Blocks Set", brand: "Fisher-Price", price: 799, oldPrice: 1599,
    img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
    desc: "Organic wooden rainbow building block set."
  },

  // ── 11. SPORTS & FITNESS (Vendor 3: StepRight Footwear) ──
  {
    category: "Sports & Fitness", subCategory: "Yoga Mats", vendorIdx: 3,
    name: "6mm Extra Thick TPE Yoga Mat", brand: "Boldfit", price: 699, oldPrice: 1399,
    img: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
    desc: "Anti-slip eco TPE foam yoga mat with strap."
  },

  // ── 12. JEWELLERY (Vendor 4: TechGalaxy Electronics / Jewellery) ──
  {
    category: "Jewellery", subCategory: "Gold Plated Necklaces", vendorIdx: 4,
    name: "24K Gold Kundan Choker Necklace Set", brand: "Zaveri Pearls", price: 1299, oldPrice: 2599,
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    desc: "Traditional Kundan & pearl drop choker necklace set."
  },

  // ── 13. BAGS (Vendor 2: Royal Men's Hub / Bags) ──
  {
    category: "Bags", subCategory: "Tote Bags", vendorIdx: 2,
    name: "Premium Leather Structured Tote Bag", brand: "Caprese Style", price: 1599, oldPrice: 3199,
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    desc: "Structured faux leather tote bag with laptop sleeve."
  },

  // ── 14. WATCHES (Vendor 2: Royal Men's Hub / Watches) ──
  {
    category: "Watches", subCategory: "Chronograph Watches", vendorIdx: 2,
    name: "Stainless Steel Chronograph Watch", brand: "Titan Style", price: 2799, oldPrice: 5599,
    img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
    desc: "Waterproof stainless steel chronograph dial watch."
  }
];

// ── SEED EXECUTION ────────────────────────────────────
const seedDB = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing old products from MongoDB...");
    await Product.deleteMany({});

    console.log("📦 Creating 5 Vendors and seeding sample products for categories & subcategories...\n");

    // Seed Super Admin Account
    let adminUser = await User.findOne({ email: "admin@shopsphere.com" });
    if (!adminUser) {
      const adminHashed = await bcrypt.hash("Admin@123", 10);
      await User.create({ name: "ShopSphere Super Admin", email: "admin@shopsphere.com", password: adminHashed, role: "admin" });
    }

    // Seed Demo Customer Account
    let customerUser = await User.findOne({ email: "customer@shopsphere.com" });
    if (!customerUser) {
      const userHashed = await bcrypt.hash("User@123", 10);
      await User.create({ name: "Devansh Bhatiya", email: "customer@shopsphere.com", password: userHashed, role: "user" });
    }

    // Seed Demo Delivery Executive Account
    let deliveryUser = await User.findOne({ email: "delivery@shopsphere.com" });
    if (!deliveryUser) {
      const deliveryHashed = await bcrypt.hash("Delivery@123", 10);
      await User.create({ name: "Ramesh Kumar", email: "delivery@shopsphere.com", password: deliveryHashed, role: "delivery" });
    }

    const vendorMap = {};
    for (let i = 0; i < VENDORS.length; i++) {
      const v = VENDORS[i];
      let user = await User.findOne({ email: v.email });
      const hashed = await bcrypt.hash("Vendor@123", 10);
      if (!user) {
        user = await User.create({ name: v.name, email: v.email, password: hashed, role: "vendor" });
      }
      vendorMap[i] = user;
    }

    let count = 0;
    for (const p of SAMPLE_PRODUCTS) {
      const vendorUser = vendorMap[p.vendorIdx];

      await Product.create({
        name: p.name,
        brand: p.brand,
        category: p.category,
        subCategory: p.subCategory,
        description: p.desc,
        price: p.price,
        oldPrice: count % 6 === 0 ? Math.round(p.price * 1.35) : 0,
        images: [p.img],
        stock: 50,
        rating: 4.8,
        reviews: 200,
        seller: vendorUser.name,
        createdBy: vendorUser._id,
        status: "approved", // LIVE ON STORE
        rejectionReason: "",
        specifications: { color: "Standard", material: "Premium", warranty: "1 Year" }
      });

      count++;
      console.log(`   ✅ [APPROVED & LIVE] "${p.name}" (${p.category} › ${p.subCategory}) by ${vendorUser.name}`);
    }

    console.log(`\n======================================================`);
    console.log(`✅ Seeding Complete! Total Products: ${count}`);
    console.log(`   Status: ALL PRODUCTS ARE APPROVED & LIVE ON STORE!`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
};

export const runAutoSeed = async () => {
  const Product = (await import("./models/Product.js")).default;
  const count = await Product.countDocuments();
  if (count === 0) {
    await seedDB(false);
  }
};

if (process.argv[1] && process.argv[1].includes("seeder.js")) {
  seedDB(true);
}

