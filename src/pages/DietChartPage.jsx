// DietChartPage.jsx
import { useLocation, useNavigate } from "react-router-dom";


export default function DietChartPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dietObj = location.state?.dietObj?.diet_chart;

 if (!dietObj) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-4">No Diet Chart Found</h1>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-teal-500 rounded-md text-black font-semibold hover:bg-teal-600 transition"
        >
          Go Back
        </button>
      </div>
    );
    return null;
  }
  const renderMealCard = (title, items, label) => (
    <div className="bg-[#1e1e1e] p-5 rounded-xl shadow-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-teal-400">{title}</h2>
        <span className="text-xs font-semibold  text-teal-400 bg-opacity-20 px-3 py-1 rounded-full">
          {label}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex justify-between bg-[#2c2c2c] p-3 rounded-lg"
          >
            <span className="font-medium">{item.option}</span>
            <span className="text-gray-400">{item.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-teal-400 mb-6 text-center">
        Your Personalized Diet Chart
      </h1>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
  {renderMealCard("Breakfast", dietObj.Breakfast, "3 Options")}
  {renderMealCard("Lunch", dietObj.Lunch, "3 Options")}
  {renderMealCard("Snacks", dietObj.Snacks, "3 Options")}
  {renderMealCard("Dinner", dietObj.Dinner, "3 Options")}
</div>

      <div className="mt-8 bg-[#1e1e1e] p-5 rounded-xl shadow-lg w-full max-w-4xl flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-teal-400">Total Calories</h3>
          <p className="text-gray-300">{dietObj.total_calories} kcal</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-teal-400">Total Protein</h3>
          <p className="text-gray-300">{dietObj.total_protein} g</p>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-6 py-3 bg-teal-500 rounded-md text-black font-semibold hover:bg-teal-600 transition"
      >
        Back
      </button>
    </div>
  );
}
