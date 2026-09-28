import { Fragment } from "react";
import { HStack, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";

export interface BreadcrumbItem {
  label: string;
  /** omit for the current page, which renders as plain text */
  to?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  justify?: "flex-start" | "center";
}

export default function PageBreadcrumb({ items, justify = "flex-start" }: PageBreadcrumbProps) {
  return (
    <HStack as="nav" aria-label="Breadcrumb" gap={1.5} fontSize="sm" color="fg.muted" wrap="wrap" justify={justify}>
      {items.map((item, index) => (
        <Fragment key={`${index}-${item.label}`}>
          {index > 0 && <IoChevronForward aria-hidden />}
          {item.to ? (
            <Link asChild color="fg.muted" _hover={{ color: "fg" }}>
              <RouterLink to={item.to}>{item.label}</RouterLink>
            </Link>
          ) : (
            <Text color="fg" aria-current="page">{item.label}</Text>
          )}
        </Fragment>
      ))}
    </HStack>
  );
}
