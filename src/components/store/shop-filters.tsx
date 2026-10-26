"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FilterCategoryOption {
  slug: string;
  name: string;
}

export interface FilterBrandOption {
  slug: string;
  name: string;
}

export interface CurrentShopFilters {
  q?: string;
  category?: string;
  brand?: string;
  availability?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

export function ShopFiltersLayout({
  categories,
  brands,
  current,
  totalCount,
  children,
}: {
  categories: FilterCategoryOption[];
  brands: FilterBrandOption[];
  current: CurrentShopFilters;
  totalCount: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [q, setQ] = useState(current.q || "");
  const [category, setCategory] = useState(current.category || "");
  const [brand, setBrand] = useState(current.brand || "");
  const [availability, setAvailability] = useState(current.availability || "");
  const [minPrice, setMinPrice] = useState(current.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(current.maxPrice || "");
  const [sort, setSort] = useState(current.sort || "featured");

  const applyFilters = (overrides?: Partial<CurrentShopFilters>) => {
    const next = {
      q,
      category,
      brand,
      availability,
      minPrice,
      maxPrice,
      sort,
      ...overrides,
    };

    const params = new URLSearchParams();
    if (next.q?.trim()) params.set("q", next.q.trim());
    if (next.category) params.set("category", next.category);
    if (next.brand) params.set("brand", next.brand);
    if (next.availability) params.set("availability", next.availability);
    if (next.minPrice) params.set("minPrice", next.minPrice);
    if (next.maxPrice) params.set("maxPrice", next.maxPrice);
    if (next.sort && next.sort !== "featured") params.set("sort", next.sort);

    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
    setDrawerOpen(false);
  };

  const resetFilters = () => {
    setQ("");
    setCategory("");
    setBrand("");
    setAvailability("");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
    router.push("/shop");
    setDrawerOpen(false);
  };

  const renderFilterControls = (idPrefix: string) => (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label
          htmlFor={`${idPrefix}-search-input`}
          className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-2"
        >
          Search Menu
        </label>
        <div className="relative">
          <input
            id={`${idPrefix}-search-input`}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters({ q: e.currentTarget.value });
            }}
            placeholder="Cultivar, terpene, SKU..."
            className="w-full rounded-[6px] border border-[#D6CBB9] bg-white pl-3 pr-9 py-2 text-sm text-[#1C1C19] placeholder:text-[#5F5B52]/70"
          />
          <Search className="h-4 w-4 text-[#5F5B52] absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor={`${idPrefix}-category-select`}
          className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-2"
        >
          Category
        </label>
        <select
          id={`${idPrefix}-category-select`}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            applyFilters({ category: e.target.value });
          }}
          className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label
          htmlFor={`${idPrefix}-brand-select`}
          className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-2"
        >
          Brand / Producer
        </label>
        <select
          id={`${idPrefix}-brand-select`}
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            applyFilters({ brand: e.target.value });
          }}
          className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div>
        <label
          htmlFor={`${idPrefix}-availability-select`}
          className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-2"
        >
          Availability
        </label>
        <select
          id={`${idPrefix}-availability-select`}
          value={availability}
          onChange={(e) => {
            setAvailability(e.target.value);
            applyFilters({ availability: e.target.value });
          }}
          className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-2 text-sm text-[#1C1C19]"
        >
          <option value="">All Products</option>
          <option value="in_stock">In Stock Only</option>
        </select>
      </div>

      {/* Price Range in ZAR */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-[#1C1C19] mb-2">
          Price Range (ZAR)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={`${idPrefix}-min-price`} className="sr-only">
              Minimum Price (R)
            </label>
            <input
              id={`${idPrefix}-min-price`}
              type="number"
              min={0}
              placeholder="Min R"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-2.5 py-1.5 text-sm text-[#1C1C19]"
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-max-price`} className="sr-only">
              Maximum Price (R)
            </label>
            <input
              id={`${idPrefix}-max-price`}
              type="number"
              min={0}
              placeholder="Max R"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-[6px] border border-[#D6CBB9] bg-white px-2.5 py-1.5 text-sm text-[#1C1C19]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button variant="primary" size="md" onClick={() => applyFilters()}>
          Apply Filters
        </Button>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Reset All
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="rounded-[8px] border border-[#D6CBB9] bg-[#E7DECF]/45 p-5">
          <h2 className="font-serif text-lg text-[#1C1C19] border-b border-[#D6CBB9] pb-3 mb-4">
            Refine Selection
          </h2>
          {renderFilterControls("desktop")}
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 w-full">
        {/* Top Bar: Mobile Filter Trigger + Count + Sort */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#D6CBB9] pb-4">
          <div className="flex items-center gap-3">
            <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
              <Dialog.Trigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filter Menu</span>
                </Button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1C1C19]/60" />
                <Dialog.Content
                  aria-describedby={undefined}
                  className="fixed inset-y-0 left-0 z-50 w-full max-w-xs border-r border-[#D6CBB9] bg-[#F7F3EA] p-6 overflow-y-auto focus:outline-none"
                >
                  <div className="flex items-center justify-between border-b border-[#D6CBB9] pb-4 mb-5">
                    <Dialog.Title className="font-serif text-xl text-[#1C1C19]">
                      Filter Menu
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close filters"
                        className="rounded-[4px] border border-[#D6CBB9] bg-white p-1.5 text-[#1C1C19]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>
                  {renderFilterControls("mobile")}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <p className="text-xs text-[#5F5B52]">
              Showing <strong className="text-[#1C1C19]">{totalCount}</strong>{" "}
              {totalCount === 1 ? "preparation" : "preparations"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="shop-sort-select"
              className="text-xs text-[#5F5B52] font-medium"
            >
              Sort by:
            </label>
            <select
              id="shop-sort-select"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                applyFilters({ sort: e.target.value });
              }}
              className="rounded-[6px] border border-[#D6CBB9] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1C19]"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
