import { Button, Link } from "@chakra-ui/react"
import type { Round } from "../../../types/Round"
import { LuSwords } from "react-icons/lu"
import { MdOutlineCheck } from "react-icons/md";

interface RoundNavButtonProps {
  href: string,
  round: Round,
  isFocus: boolean
  isFamily: boolean,
}

export default function RoundNavButton({href, round, isFocus, isFamily}: RoundNavButtonProps) {
  return (
    <>
      <Link
        key={`roundNavButton-${round.id}`}
        display="flex"
        justifyContent="center"
        href={href}
      >
        <Button
          size="sm"
          colorPalette={isFocus || isFamily ? "cyan" : "blue"}
          variant={isFocus ? "surface" : "outline"}
          width="180px"
          whiteSpace="normal"
          wordBreak="break-word"
          textAlign="center"
          py={"24px"}
          fontWeight={isFocus ? "bold" : "normal"}
        >
          {round.status === "In Progress" &&
            <LuSwords />
          }
          {round.status === "Complete" &&
            <MdOutlineCheck />
          }
          {round.name}
        </Button>
      </Link>      
    </>
  )
}