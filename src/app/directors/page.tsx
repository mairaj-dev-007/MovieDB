"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Film } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  rating: number;
  directorId: string;
  genreId: string;
  posterUrl: string;
  url?: string;
}

interface Genre {
  id: string;
  name: string;
  description: string;
}

interface Director {
  id: string;
  name: string;
  biography: string;
  url: string;
}

interface ApiData {
  movies: Movie[];
  genres: Genre[];
  directors: Director[];
}

export default function DirectorsPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data");
        if (response.ok) {
          const apiData = await response.json();
          setData(apiData);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch directors data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch directors data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredDirectors =
    data?.directors.filter((director) =>
      director.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const renderDirectorCard = (director: Director) => {
    const directorMovies =
      data?.movies.filter((m) => m.directorId === director.id) || [];

    const avgRating =
      directorMovies.length > 0
        ? (
            directorMovies.reduce((acc, m) => acc + m.rating, 0) /
            directorMovies.length
          ).toFixed(1)
        : "N/A";

    const latestMovie = directorMovies.reduce(
      (latest, current) =>
        current.releaseYear > (latest?.releaseYear || 0) ? current : latest,
      directorMovies[0]
    );

    return (
      <HoverCard key={director.id}>
        <HoverCardTrigger asChild>
          <Card className="overflow-hidden h-[500px] flex flex-col bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl transform hover:-translate-y-1">
            <CardContent className="p-0 flex-1">
              {/* Director Image */}
              <div className="relative h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <img
                  src={director.url}
                  alt={director.name}
                  className="w-full h-full object-cover object-center"
                />
                {/* Stats overlay */}
                <div className="absolute top-4 right-4 flex gap-3">
                  <div className="bg-black/60 text-white px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <Film className="h-4 w-4" />
                    <span>{directorMovies.length}</span>
                  </div>
                  <div className="bg-black/60 text-white px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{avgRating}</span>
                  </div>
                </div>
              </div>
              {/* Content */}
              <div className="p-4">
                <h2 className="text-xl font-bold mb-3">{director.name}</h2>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {director.biography}
                </p>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-3 bg-gray-50/80 backdrop-blur-sm">
              <Button
                className="w-full bg-black hover:bg-gray-900 text-white shadow-sm"
                asChild
              >
                <Link href={`/directors/${director.id}`}>View Profile</Link>
              </Button>
            </CardFooter>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4">
          <div className="space-y-3">
            <h4 className="text-base font-bold">{director.name}</h4>
            <p className="text-sm text-gray-600">{director.biography}</p>
            {latestMovie && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-gray-900">
                  Latest Film: {latestMovie.title} ({latestMovie.releaseYear})
                </p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm ml-1">
                    {latestMovie.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Directors</h1>
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search directors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4"
            />
          </div>
        </div>

        {/* Directors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={i}
                  className="overflow-hidden h-[500px] flex flex-col bg-white shadow-xl rounded-xl"
                >
                  <CardContent className="p-0 flex-1">
                    <Skeleton className="h-[300px] w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : // Actual director cards
              filteredDirectors.map((director) => renderDirectorCard(director))}
        </div>

        {/* No results message */}
        {!isLoading && filteredDirectors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No directors found matching your search.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="mx-auto"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
