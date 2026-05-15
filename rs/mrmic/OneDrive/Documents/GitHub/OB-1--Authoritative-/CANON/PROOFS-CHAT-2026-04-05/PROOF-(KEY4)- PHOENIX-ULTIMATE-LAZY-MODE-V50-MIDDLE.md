# PROOF - (KEY4)- PHOENIX-ULTIMATE-LAZY-MODE-V50 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\(KEY4)- PHOENIX-ULTIMATE-LAZY-MODE-V50.txt

        <li key={i} className="flex justify-between items-center py-2">
          <span className="font-mono text-cyan-600 dark:text-cyan-400">{m}</span>
          <button className="ml-2 text-red-500 hover:text-red-700 font-bold" onClick={() => unloadModule(m)}>Unload</button>
        </li>
      ))}
      {modules.length === 0 && <li className="text-slate-400 italic">No modules loaded.</li>}
    </ul>
  );
}

