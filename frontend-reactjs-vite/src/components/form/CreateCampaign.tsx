import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Import the left arrow icon
import { toast } from "react-toastify";

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "",
    deadline: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new mock campaign with the same structure as our shared mock data
    const newCampaign = {
      id: `${Date.now()}`,
      charity_id: "charity123",
      title: formData.name,
      description: formData.description,
      target_amount: parseFloat(formData.goal),
      current_amount: 0,
      status: "active",
      created_at: new Date().toISOString().split('T')[0],
      deadline: formData.deadline,
      image_url: "https://example.com/placeholder.jpg"
    };
    
    console.log("Campaign Created:", newCampaign);
    toast.success("Campaign created successfully! (Mock data)");
    navigate("/Vhack-2025/charity/home");
  };

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div className="p-6 bg-[var(--background)] text-[var(--paragraph)] max-w-3xl mx-auto rounded-lg shadow-lg">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center text-[var(--headline)] mb-6 hover:underline"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-3xl font-bold text-[var(--headline)] mb-6">Create Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--headline)]">
            Campaign Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none"
            placeholder="Enter campaign name"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--headline)]">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none"
            placeholder="Enter campaign description"
            rows={4}
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-[var(--headline)]">
            Funding Goal ($)
          </label>
          <input
            type="number"
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none"
            placeholder="Enter funding goal"
            required
          />
        </div>
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-[var(--headline)]">
            Deadline
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--highlight)] focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all"
        >
          Create Campaign
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;