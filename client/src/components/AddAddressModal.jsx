import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const InputField = ({ type = "text", placeholder, name, handleChange, address }) => (
  <input
    className="w-full px-3 py-2.5 border border-gray-500/30 rounded outline-none focus:border-primary transition"
    type={type}
    onChange={handleChange}
    placeholder={placeholder}
    name={name}
    value={address[name] || ""}
    required
  />
);

const AddAddressModal = ({ open, onClose, onSaved, editAddress }) => {
  const { axios } = useAppContext();

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    label: "Home",
    isDefault: false,
  });

  useEffect(() => {
    if (!open) return;

    if (editAddress) {
      setAddress({
        ...editAddress,
        isDefault: editAddress.isDefault || false,
      });
    } else {
      setAddress({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phone: "",
        label: "Home",
        isDefault: false,
      });
    }
  }, [open, editAddress]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = editAddress
        ? await axios.put(`/api/address/${editAddress._id}`, { address })
        : await axios.post("/api/address/add", { address });

      if (data.success) {
        toast.success("Address saved");
        onSaved(data.address);
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-medium mb-4">
          {editAddress ? "Edit Address" : "Add Address"}
        </h2>

        <form onSubmit={onSubmitHandler} className="space-y-4 text-sm">
          {/* LABEL */}
          <select
            name="label"
            value={address.label}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border rounded outline-none"
          >
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>

          {/* DEFAULT CHECKBOX */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isDefault"
              checked={address.isDefault}
              onChange={handleChange}
            />
            Set as default address
          </label>

          <div className="grid grid-cols-2 gap-4">
            <InputField name="firstName" placeholder="First Name" handleChange={handleChange} address={address} />
            <InputField name="lastName" placeholder="Last Name" handleChange={handleChange} address={address} />
          </div>

          <InputField name="email" type="email" placeholder="Email" handleChange={handleChange} address={address} />
          <InputField name="street" placeholder="Street" handleChange={handleChange} address={address} />

          <div className="grid grid-cols-2 gap-4">
            <InputField name="city" placeholder="City" handleChange={handleChange} address={address} />
            <InputField name="state" placeholder="State" handleChange={handleChange} address={address} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField name="zipCode" placeholder="Zip Code" handleChange={handleChange} address={address} />
            <InputField name="country" placeholder="Country" handleChange={handleChange} address={address} />
          </div>

          <InputField name="phone" placeholder="Phone" handleChange={handleChange} address={address} />

          <button className="w-full bg-primary text-white py-3 hover:bg-primary-dull transition">
            Save Address
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAddressModal;
