import Sidebar from "@/components/Common/sidebar";
import React from "react";

function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}

export default Layout;
