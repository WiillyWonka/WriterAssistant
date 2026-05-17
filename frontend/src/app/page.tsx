"use client";

import { useEffect, useState } from "react";
import { SplitLayout } from "@/components/Layout/SplitLayout";
import { initKeycloak, login, logout, getUsername, keycloak } from "@/lib/keycloak";

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const isAuth = await initKeycloak();
      setAuthenticated(isAuth);
      setInitialized(true);
      
      if (isAuth) {
        setUsername(getUsername());
        
        // Update token periodically
        setInterval(() => {
          if (keycloak.isTokenExpired(5)) {
            keycloak.updateToken(5).catch(() => {
              logout();
            });
          }
        }, 60000);
      }
    };

    initializeAuth();
  }, []);

  if (!initialized) {
    return (
      <main className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Загрузка...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Writer Assistant</h1>
          <p className="mb-6 text-gray-600">Пожалуйста, войдите для продолжения</p>
          <button
            onClick={login}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Войти через Keycloak
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen">
      <SplitLayout onLogout={logout} username={username} />
    </main>
  );
}
