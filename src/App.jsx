
// export default App;
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function extractJsonFromString(str) {
  try {
    const cleaned = str
      .replace(/```json\s*/i, "") // remove starting ```json
      .replace(/```/g, "")        // remove ending ```
      .trim();

    // Parse into JSON
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Invalid JSON format:", error);
    return null;
  }
}

function App() {
  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    heightUnit: "cm",
    height: "",
    feet: "",
    inches: "",
    weight: "",
    targetWeight: "",
    timeFrame: "",
    dietType: "",
    goal: "",
    workoutType: "",
    preferredCuisine: "",
    otherCuisine: "",
    budget: "",
    budgetCurrency: "INR",
    customPreferences: ""
  });
  const [step, setStep] = useState(1);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const API_KEY = import.meta.env.VITE_KEY;
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const handleNext = () => {
    const { name, gender, age, weight, targetWeight, height, feet, inches, heightUnit } = form;
  
    // Check if all fields are filled based on the selected height unit
    const isHeightValid = heightUnit === 'cm' ? !!height : (!!feet && !!inches);
    const isValid = !!name && !!gender && !!age && !!weight && !!targetWeight && isHeightValid;
  
    if (isValid) {
      setStep(2);
      setShowWarning(false); // Hide the warning if everything is valid
    } else {
      setShowWarning(true); // Show the warning if fields are missing
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnswer("");

    const heightInCm =
      form.heightUnit === "cm"
        ? form.height
        : Math.round(Number(form.feet) * 30.48 + Number(form.inches) * 2.54);

    const prompt = `
Generate a personalized diet chart strictly in the following JSON format.
Do NOT include markdown, code fences, explanations, or extra keys.
Replace only the values inside quotes with the generated diet details.
Keep the JSON keys exactly the same as below.
For each meal (Breakfast, Lunch, Snacks, Dinner), provide three alternative options 
— the user will eat only one option per meal 
— and calculate total_calories and total_protein based on one option from each meal.

{
  "diet_chart": {
    "Breakfast": [
      { "option": "", "quantity": "" },
      { "option": "", "quantity": "" },
      { "option": "", "quantity": "" }
    ],
    "Lunch": [
      { "option": "", "quantity": "" },
      { "option": "", "quantity": "" },
      { "option": "", "quantity": "" }
    ],
    "Snacks": [
      { "option": "", "quantity": "" },
      { "option": "", "quantity": "" },
      { "option": "", "quantity": "" }
    ],
    "Dinner": [
      { "option": "", "quantity": "" },
      { "option": "", "quantity": "" },
      { "option": "", "quantity": "" }
    ],
    "total_calories": "",
    "total_protein": ""
  }
}

Details to use for the diet chart:
Name: ${form.name}
Gender: ${form.gender}
Age: ${form.age}
Height: ${heightInCm} cm
Weight: ${form.weight} kg
Type: ${form.dietType}
Target Weight: ${form.targetWeight} kg
Workout Type: ${form.workoutType}
Transformation Timeframe: ${form.timeFrame}
Goal: ${form.goal}
Preferred Cuisine: ${form.preferredCuisine === "Other" ? form.otherCuisine : form.preferredCuisine}
Monthly Budget Except Home Food: ${form.budget} ${form.budgetCurrency}
Custom Preferences: ${form.customPreferences}


Rules:
- Return ONLY the JSON shown above.
- Keep the keys exactly as in the template.
- Fill each "option" with the food item.
- Fill each "quantity" with the specific measurement.
- "total_calories" is the sum for the whole day.
- "total_protein" is the sum for the whole day in grams.
- No markdown, no backticks, no explanations.

`;

    try {
      const response = await axios({
        url: API_KEY,
        method: "post",
        data: {
          contents: [{ parts: [{ text: prompt }] }],
        },
      });

      const result = response.data.candidates[0].content.parts[0].text;
      console.log("real response" ,result);
      setAnswer(result);
    } catch (error) {
      setAnswer("Failed to generate diet chart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center p-6">
      <h1 className="text-5xl font-extrabold mb-1 text-teal-400">Dietly</h1>
      <h3 className="text-gray-400 mb-4 mt-1.5 text-center max-w-lg text-teal-600">
        Your AI-Powered Personal Diet Planner
      </h3>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#1e1e1e] p-6 rounded-2xl shadow-lg space-y-5"
      >
        {step === 1 && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <input
              type="number"
              name="age"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                {form.heightUnit === "cm" ? (
                  <input
                    type="number"
                    name="height"
                    placeholder="Height (cm)"
                    value={form.height}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                  />
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="feet"
                      placeholder="Feet"
                      value={form.feet}
                      onChange={handleChange}
                      className="w-1/2 p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      required
                    />
                    <input
                      type="number"
                      name="inches"
                      placeholder="Inches"
                      value={form.inches}
                      onChange={handleChange}
                      className="w-1/2 p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Unit
                </label>
                <select
                  name="heightUnit"
                  value={form.heightUnit}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="cm">Centimeters</option>
                  <option value="ft-in">Feet/Inches</option>
                </select>
              </div>
            </div>

            <input
              type="number"
              name="weight"
              placeholder="Current Weight (kg)"
              value={form.weight}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />

            <input
              type="number"
              name="targetWeight"
              placeholder="Target Weight (kg)"
              value={form.targetWeight}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />

{showWarning && (
  <div className="p-3 text-sm text-red-400 bg-red-900 bg-opacity-30 rounded-md text-center">
    Please fill out all the required fields.
  </div>
)}

<button
  type="button"
  onClick={handleNext}
  className="w-full p-3 rounded-md bg-teal-400 text-white font-semibold hover:bg-teal-500 transition"
>
  Next
</button>
          </>
        )}

        {step === 2 && (
          <>
            <select
              name="workoutType"
              value={form.workoutType}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            >
              <option value="">Workout Type</option>
              <option value="6 days a week gym">6 Days a Week Gym</option>
              <option value="5 days a week gym">5 Days a Week Gym</option>
              <option value="4 days a week gym">4 Days a Week Gym</option>
              <option value="3 days a week gym">3 Days a Week Gym</option>
              <option value="home exercise">Home Exercise</option>
              <option value="sportsperson">Sportsperson</option>
              <option value="no workout">No Workout</option>
            </select>

            <select
              name="timeFrame"
              value={form.timeFrame}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            >
              <option value="">Transformation Time</option>
              <option value="1 month">1 Month</option>
              <option value="3 months">3 Months</option>
              <option value="5 months">5 Months</option>
              <option value="6 months">6 Months</option>
              <option value="9 months">9 Months</option>
              <option value="12 months">12 Months</option>
            </select>

            <select
              name="dietType"
              value={form.dietType}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            >
              <option value="">Diet Type</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
              <option value="Eggetarian">Eggetarian</option>
            </select>

            <select
              name="preferredCuisine"
              value={form.preferredCuisine}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            >
              <option value="">Preferred Cuisine</option>
              <option value="North Indian">North Indian</option>
              <option value="South Indian">South Indian</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Rajasthani">Rajasthani</option>
              <option value="Bengali">Bengali</option>
              <option value="Punjabi">Punjabi</option>
              <option value="Kashmiri">Kashmiri</option>
              <option value="Maharashtrian">Maharashtrian</option>
              <option value="Goan">Goan</option>
              <option value="North Eastern">North Eastern</option>
              <option value="Mixed Indian">Mixed Indian</option>
              <option value="Other">Other (type below)</option>
            </select>

            {form.preferredCuisine === "Other" && (
              <input
                type="text"
                name="otherCuisine"
                placeholder="Enter your preferred cuisine or country name"
                value={form.otherCuisine}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            )}

            <div className="flex gap-3">
              <input
                type="number"
                name="budget"
                placeholder="Monthly Budget Except Home Food"
                value={form.budget}
                onChange={handleChange}
                className="flex-1 p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-[13px]"
              />
              <select
                name="budgetCurrency"
                value={form.budgetCurrency}
                onChange={handleChange}
                className="w-28 p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
              </select>
            </div>

            <select
              name="goal"
              value={form.goal}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            >
              <option value="">Select Goal</option>
              <option value="build muscle">Build Muscular Body</option>
              <option value="women fitness">Women Fitness</option>
              <option value="stay fit">Stay Fit</option>
            </select>
            <textarea
              name="customPreferences"
              placeholder="Describe your preferences (e.g., mostly eat eggs, paneer, chicken breast, or prefer only home-cooked meals) Anything you want to add"
              value={form.customPreferences}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-[#2c2c2c] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[100px]"
            ></textarea>

            

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 p-3 rounded-md bg-gray-700 text-white font-semibold hover:bg-gray-600 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 p-3 rounded-md text-white transition ${
                  loading ? "bg-teal-800 cursor-not-allowed" : "bg-teal-400 hover:bg-teal-500"
                }`}
              >
                {loading ? "Generating Diet Plan..." : "Generate Diet Plan"}
              </button>
            </div>
          </>
        )}

        {loading && (
          <div className="w-full h-2 rounded-full overflow-hidden bg-teal-900 mt-4">
            <div className="h-full bg-teal-400 animate-progressBar"></div>
          </div>
        )}
      </form>

      {answer && !loading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div className="flex flex-col items-center w-full max-w-xl bg-[#1e1e1e] p-8 rounded-2xl shadow-2xl whitespace-pre-wrap text-gray-300">
      <h2 className="text-2xl font-semibold mb-6 text-teal-400 text-center w-full">
         Diet Chart Generated
      </h2>
      <button
        onClick={() => {
          const parsed = extractJsonFromString(answer);
          navigate("/diet", { state: { dietObj: parsed } });
        }}
        className="mt-1 px-6 py-3 bg-teal-500 rounded-md text-black font-semibold hover:bg-teal-600 transition"
      >
        View Diet Chart
      </button>
    </div>
  </div>
)}

      <style>{`
        @keyframes progressBar {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-progressBar {
          animation: progressBar 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default App;