
import {
  ErrorHandlerProvider,   
  StrataProviders,
  ThemeProvider,
} from "strata-foundation-react-xnft/src";
import React from "react";
import { Wallet } from "./Wallet";

export const Providers: any = ({ children }: any) => {
  return (
    <ThemeProvider>
      <ErrorHandlerProvider>
        <Wallet>
          <StrataProviders>
            {children}
          </StrataProviders>
        </Wallet>
      </ErrorHandlerProvider>
    </ThemeProvider>
  );
}
