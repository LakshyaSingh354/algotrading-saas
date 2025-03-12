"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";


export default function StrategyUpload() {
    const [name, setName] = useState("");
    const [param1, setParam1] = useState("");
    const [param2, setParam2] = useState("");
    const [param3, setParam3] = useState("");
    const [param4, setParam4] = useState("");
    const [param5, setParam5] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file) {
        setMessage("Please upload a Python file.");
        return;
      }
  
      // Upload file to Supabase Storage
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      let file_name = file.name.split(".")[0];
      file_name = `${file_name}_${session?.session?.user?.id}.py`;
      const filePath = `strategies/${file_name}`;
      const { data: fileData, error: fileError } = await supabase.storage
        .from("strategies")
        .upload(filePath, file);
  
      if (fileError) {
        setMessage(`File upload error: ${fileError.message}`);
        return;
      }
  
      // Insert strategy data into Supabase
      const { data, error } = await supabase.from("py_strategies").insert([
        {
          name,
          user_id: session?.session?.user?.id,
          strategy_file: file.name,
          param_1: parseFloat(param1),
          param_2: parseFloat(param2),
          param_3: parseFloat(param3),
          param_4: param4,
          param_5: param5,
          file_path: `${fileData?.path}`,
        },
      ]);
  
      if (error) {
        setMessage(`Error saving strategy: ${error.message}`);
      } else {
        setMessage("✅ Strategy uploaded successfully!");
        setName("");
        setParam1("");
        setParam2("");
        setParam3("");
        setParam4("");
        setParam5("");
        setFile(null);
      }
    };
  
    return (
      <div className="bg-gray-900 min-h-screen mt-[-35px] p-8 px-56">
        <h1>📂 Upload Python Strategy</h1>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <label>Strategy Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
  
          <label>Parameter 1 (float):</label>
          <input type="number" value={param1} onChange={(e) => setParam1(e.target.value)} step="0.01" required />
  
          <label>Parameter 2 (float):</label>
          <input type="number" value={param2} onChange={(e) => setParam2(e.target.value)} step="0.01" required />
  
          <label>Parameter 3 (float):</label>
          <input type="number" value={param3} onChange={(e) => setParam3(e.target.value)} step="0.01" required />
  
          <label>Parameter 4 (string):</label>
          <input type="text" value={param4} onChange={(e) => setParam4(e.target.value)} />
  
          <label>Parameter 5 (text):</label>
          <textarea value={param5} onChange={(e) => setParam5(e.target.value)}></textarea>
  
          <label>Upload Python File:</label>
          <input type="file" accept=".py" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
  
          <button type="submit">🚀 Upload</button>
        </form>
  
        <style jsx>{`
          .container {
            background: #1c1c1c;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            max-width: 420px;
            margin: auto;
            color: #e0e0e0;
            font-family: 'Inter', sans-serif;
          }
          h1 {
            text-align: center;
            color: #2196f3;
            font-size: 24px;
          }
          input, textarea, button {
            width: 100%;
            margin-top: 10px;
            margin-bottom: 16px;
            padding: 12px;
            border-radius: 6px;
            background: #2a2a2a;
            border: 1px solid #2196f3;
            color: #e0e0e0;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          input:focus, textarea:focus {
            outline: none;
            border-color: #64b5f6;
            box-shadow: 0 0 8px #64b5f6;
          }
          button {
            background: #2196f3;
            color: white;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            border: none;
            transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
          }
          button:hover {
            background: #64b5f6;
            transform: scale(1.05);
            box-shadow: 0 0 12px #64b5f6;
          }
          .message {
            text-align: center;
            color: #64b5f6;
            font-weight: bold;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }