import { useLocalStorage } from "../hooks";

/** Gets/sets the ports used to communicate with Manatee */
export const usePorts = () => {
  const [ports, setPorts] = useLocalStorage<{
    port: number;
    securePort: number;
  }>("ports", { port: 0, securePort: 0 });

  return {
    port: ports.port,
    securePort: ports.securePort,
    setPorts,
  };
};

/** Gets/sets the credentials used to authenticate with Manatee */
export const useCredentials = () => {
  const [encoded, setEncoded] = useLocalStorage<string>("credentials", "");
  let username = "";
  let password = "";
  if (encoded) {
    const decoded = atob(encoded);
    [username, password] = decoded.split(":");
  }

  return {
    username,
    password,
    credentials: encoded,
    setCredentials(username: string, password: string) {
      setEncoded(btoa(`${username}:${password}`));
    },
  };
};
