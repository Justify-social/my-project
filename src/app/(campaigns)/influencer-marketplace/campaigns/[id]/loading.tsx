import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {  Card  } from "@/components/ui/card";
import {  Tabs, TabsList, TabsTrigger  } from "@/components/ui/tabs";

export default function Loading() {
  return (
    <div className="container mx-auto py-10 px-4 font-work-sans">
      {/* Back navigation */}
      <div className="mb-6">
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Campaign Header Skeleton */}
      <Card className="p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Brand logo skeleton */}
          <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
          
          {/* Campaign details skeleton */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Skeleton className="h-8 w-64 mb-1" />
                <Skeleton className="h-4 w-40 mb-3" />
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="loading" className="mb-10">
        <TabsList className="mb-6">
          <TabsTrigger value="loading" disabled>Overview</TabsTrigger>
          <TabsTrigger value="loading2" disabled>Influencers</TabsTrigger>
          <TabsTrigger value="loading3" disabled>Content Requirements</TabsTrigger>
          <TabsTrigger value="loading4" disabled>Creative Assets</TabsTrigger>
        </TabsList>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign details skeleton */}
          <Card className="p-6 col-span-1 lg:col-span-2">
            <Skeleton className="h-7 w-48 mb-4" />
            
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {/* Objectives and KPIs skeleton */}
          <Card className="p-6">
            <Skeleton className="h-7 w-48 mb-4" />
            
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-5 w-40" />
              </div>
              
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3 mt-1" />
              </div>
            </div>
          </Card>
          
          {/* Quick Actions skeleton */}
          <Card className="p-6 col-span-1 lg:col-span-3">
            <Skeleton className="h-7 w-48 mb-4" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-md" />
              ))}
            </div>
          </Card>
        </div>
      </Tabs>
    </div>
  );
} 