import { useState } from "react";
import API from "../api/productApi";

function AdminAddProduct() {
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState([]);

  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    subCategory: "",
    description: "",
    price: "",
    oldPrice: "",
    stock: "",
    seller: "ShopSphere",
    color: "",
    warranty: "",
    weight: "",
    dimensions: "",
    material: "",
    isFeatured: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setImages(files);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviewImages(previews);
  };
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const data = new FormData();

    // Append all form fields
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Append images
    images.forEach((image) => {
      data.append("images", image);
    });

    const response = await API.post("/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert(response.data.message);

    // Reset form
    setFormData({
      name: "",
      brand: "",
      category: "",
      subCategory: "",
      description: "",
      price: "",
      oldPrice: "",
      stock: "",
      seller: "ShopSphere",
      color: "",
      warranty: "",
      weight: "",
      dimensions: "",
      material: "",
      isFeatured: false,
    });

    setImages([]);
    setPreviewImages([]);

  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
      "Something went wrong!"
    );
  } finally {
    setLoading(false);
  }
};
  return (
  <div
    style={{
      maxWidth: "900px",
      margin: "40px auto",
      padding: "20px",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    }}
  >
    <h1>Add Product</h1>

    <form onSubmit={handleSubmit}>

      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={formData.name}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="brand"
        placeholder="Brand"
        value={formData.brand}
        onChange={handleChange}
      />

      <br /><br />

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
      >
        <option value="">Select Category</option>
        <option>Ethnic Wear</option>
        <option>Western Dresses</option>
        <option>Menswear</option>
        <option>Footwear</option>
        <option>Home Decor</option>
        <option>Beauty</option>
        <option>Accessories</option>
        <option>Grocery</option>
        <option>Electronics</option>
        <option>Kids & Toys</option>
        <option>Sports & Fitness</option>
        <option>Jewellery</option>
        <option>Bags</option>
        <option>Watches</option>
      </select>

      <br /><br />

      <input
        type="text"
        name="subCategory"
        placeholder="Sub Category"
        value={formData.subCategory}
        onChange={handleChange}
      />

      <br /><br />

      <textarea
        rows="5"
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="oldPrice"
        placeholder="Old Price"
        value={formData.oldPrice}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="stock"
        placeholder="Stock"
        value={formData.stock}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="color"
        placeholder="Color"
        value={formData.color}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="material"
        placeholder="Material"
        value={formData.material}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="weight"
        placeholder="Weight"
        value={formData.weight}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="dimensions"
        placeholder="Dimensions"
        value={formData.dimensions}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="warranty"
        placeholder="Warranty"
        value={formData.warranty}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
      />

      <br /><br />

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {previewImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="preview"
            width="120"
            height="120"
            style={{
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        ))}
      </div>

      <br />

      <label>
        <input
          type="checkbox"
          name="isFeatured"
          checked={formData.isFeatured}
          onChange={handleChange}
        />
        Featured Product
      </label>

      <br /><br />

      <button
        type="submit"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Add Product"}
      </button>

    </form>
  </div>
);
}

export default AdminAddProduct;