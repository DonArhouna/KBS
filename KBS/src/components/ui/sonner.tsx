import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg !bg-white !text-gray-900",
          description: "group-[.toast]:text-gray-600 !text-gray-600",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-white group-[.toaster]:text-gray-900 !bg-white !text-gray-900",
          error: "group-[.toaster]:bg-white group-[.toaster]:text-gray-900 !bg-white !text-gray-900",
          info: "group-[.toaster]:bg-white group-[.toaster]:text-gray-900 !bg-white !text-gray-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
