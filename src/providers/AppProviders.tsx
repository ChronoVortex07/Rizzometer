import { ReactNode } from "react";
import { SocketProvider } from "./SocketProvider";
import { VideoProvider } from "./VideoProvider";

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps): JSX.Element => {
  return (
    <VideoProvider>
        <SocketProvider>
            {children}
        </SocketProvider>
    </VideoProvider>
  );
};

export default AppProviders;
