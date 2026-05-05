// hooks/useCityDB.js
import { useState, useEffect } from "react";
import initSqlJs from "sql.js";

export function useCityDB() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1. 初始化 SQL.js，指定 wasm 路径
        const SQL = await initSqlJs({
          locateFile: (file) => `/sql-wasm.wasm`, // 从 public 加载
        });

        // 2. 从 public 拉取数据库二进制
        const response = await fetch("/cities.db");
        const buffer = await response.arrayBuffer();
        const database = new SQL.Database(new Uint8Array(buffer));

        if (!cancelled) {
          setDb(database);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // 通用查询函数
  const query = (sql, params = []) => {
    if (!db) return [];
    try {
      const results = [];
      const stmt = db.prepare(sql);
      stmt.bind(params);

      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (err) {
      console.error("查询失败:", err);
      return [];
    }
  };

  return { db, loading, error, query };
}
