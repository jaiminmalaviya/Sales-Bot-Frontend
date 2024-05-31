import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

const SearchBar = ({ setSearchTerm }: any) => {
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, setSearchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <div>
      <Input
        placeholder="Search account here"
        className="placeholder:text-sm h-8 min-w-48"
        value={searchInput}
        onChange={handleChange}
        id="accounts-input-search"
      />
    </div>
  );
};

export default SearchBar;
