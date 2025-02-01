import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LoaderVariants = {
  default: "w-8 h-8",
  sm: "w-4 h-4",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const LoaderTypes = {
  spinner: "spinner",
  pulse: "pulse",
  dots: "dots",
};

const Loader = ({
  className,
  variant = "default",
  type = "spinner",
  text,
  fullScreen = false,
}) => {
  const renderLoader = () => {
    switch (type) {
      case LoaderTypes.pulse:
        return (
          <div className="space-y-4">
            <div
              className={cn(
                "relative flex animate-pulse rounded-md space-x-4",
                LoaderVariants[variant]
              )}
            >
              <div className="flex-1 space-y-4 py-1">
                <div className="h-2 bg-primary/20 rounded"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-primary/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case LoaderTypes.dots:
        return (
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "animate-bounce rounded-full bg-primary",
                  LoaderVariants[variant],
                  "animation-delay-" + i * 100
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <Loader2 className={cn("animate-spin", LoaderVariants[variant])} />
        );
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm" : "",
        className
      )}
    >
      {renderLoader()}
      {text && <p className="mt-4 text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  return content;
};

// Convenience components for different variants
export const LoaderSm = (props) => <Loader variant="sm" {...props} />;
export const LoaderLg = (props) => <Loader variant="lg" {...props} />;
export const LoaderXl = (props) => <Loader variant="xl" {...props} />;
export const FullScreenLoader = (props) => (
  <Loader
    variant="lg"
    fullScreen
    className="z-50"
    text={props.text || "Loading..."}
    {...props}
  />
);

export default Loader;
