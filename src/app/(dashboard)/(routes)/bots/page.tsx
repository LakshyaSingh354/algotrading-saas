"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";


type Bot = {
  id: number;
  bot_name: string;
  strategy_id: number;
  strategy_name?: string;
  stock_symbol: string | null;
  created_at: string;
  status: "active" | "inactive";
};

type Strategy = {
  id: number;
  name: string;
};

export default function BotManagement() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [botName, setBotName] = useState("");
  const [strategyId, setStrategyId] = useState<number | "">("");
  const [stockSymbol, setStockSymbol] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBots();
    fetchStrategies();
  }, []);

  const fetchBots = async () => {
    const { data, error } = await supabase
      .from("bots")
      .select("id, bot_name, strategy_id, stock_symbol, created_at, status, py_strategies(name)")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setBots(data || []);
  };

  const fetchStrategies = async () => {
    const { data, error } = await supabase.from("py_strategies").select("*");
    if (error) console.error(error);
    else setStrategies(data || []);
  };

  const handleAddBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName || !strategyId) return;

    const { error } = await supabase
      .from("bots")
      .insert([{ bot_name: botName, strategy_id: strategyId, stock_symbol: stockSymbol, status }]);

    if (error) {
      console.error(error);
      setMessage("Error adding bot");
    } else {
      setMessage("Bot added successfully!");
      fetchBots();
      resetForm();
    }
  };

  const handleDeleteBot = async (botId: number) => {
    const { error } = await supabase.from("bots").delete().match({ id: botId });
    if (error) {
      console.error(error);
      setMessage("Error deleting bot");
    } else {
      setMessage("Bot deleted successfully!");
      fetchBots();
    }
  };

  const resetForm = () => {
    setBotName("");
    setStrategyId("");
    setStockSymbol("");
    setStatus("active");
  };

  return (
    <div className="min-h-screen bg-gray-900 mt-[-35px] text-white flex flex-col items-center p-6">
    <div className="w-full max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Manage Bots</h1>

      {message && (
        <div className="bg-green-600 text-white p-3 rounded mb-6">
          {message}
        </div>
      )}

      {/* Add Bot Form */}
      <form onSubmit={handleAddBot} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Bot</h2>
        
        <label className="block mb-2">Bot Name:</label>
        <input 
          value={botName} 
          onChange={(e) => setBotName(e.target.value)} 
          required 
          className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
        />

        <label className="block mb-2">Strategy:</label>
        <select 
          value={strategyId} 
          onChange={(e) => setStrategyId(Number(e.target.value))} 
          required
          className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
        >
          <option value="">Select Strategy</option>
          {strategies.map((strategy) => (
            <option key={strategy.id} value={strategy.id}>
              {strategy.name}
            </option>
          ))}
        </select>

        <label className="block mb-2">Stock Symbol:</label>
        <input 
          value={stockSymbol} 
          onChange={(e) => setStockSymbol(e.target.value)} 
          className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded"
        />

        <label className="block mb-2">Status:</label>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
          className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
        >
          Add Bot
        </button>
      </form>

      {/* Existing Bots Table */}
      <h2 className="text-2xl font-semibold mt-8">Existing Bots</h2>
      <div className="overflow-x-auto w-full max-w-4xl">
        <table className="w-full mt-4 border-collapse border border-gray-700 shadow-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3 border border-gray-600">ID</th>
              <th className="p-3 border border-gray-600">Bot Name</th>
              <th className="p-3 border border-gray-600">Strategy</th>
              <th className="p-3 border border-gray-600">Stock Symbol</th>
              <th className="p-3 border border-gray-600">Created At</th>
              <th className="p-3 border border-gray-600">Status</th>
              <th className="p-3 border border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => (
              <tr key={bot.id} className="bg-gray-800 text-white text-center">
                <td className="p-3 border border-gray-700">{bot.id}</td>
                <td className="p-3 border border-gray-700">{bot.bot_name}</td>
                <td className="p-3 border border-gray-700">{bot.strategy_name}</td>
                <td className="p-3 border border-gray-700">{bot.stock_symbol}</td>
                <td className="p-3 border border-gray-700">{new Date(bot.created_at).toLocaleString()}</td>
                <td className="p-3 border border-gray-700">
                  <span className={`px-2 py-1 rounded ${bot.status === "active" ? "bg-green-600" : "bg-red-600"}`}>
                    {bot.status}
                  </span>
                </td>
                <td className="p-3 border border-gray-700">
                  <button 
                    onClick={() => handleDeleteBot(bot.id)} 
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}