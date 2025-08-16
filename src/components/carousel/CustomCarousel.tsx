import React from 'react'
import {Box, IconButton, useBreakpointValue, VStack, Heading, Container, Input, Field} from '@chakra-ui/react'
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi'
import { IoAddCircleSharp } from "react-icons/io5";
import Slider from 'react-slick'

import DialogForm from "../ui/DialogForm";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CustomCarousel.css"

import type { CarouselCard } from '../../types/CarouselCard';

interface CaptionCarouselBaseProps {
  cards: CarouselCard[];
}

interface CaptionCarouselAdminProps extends CaptionCarouselBaseProps {
  isAdmin: true;
  adminClick: () => void;
  adminLoading: boolean;
  newRoundName: string;
  setNewRoundName: (name: string) => void;
  newPlayersAdvancing: number;
  setNewPlayersAdvancing: (count: number) => void;
}

interface CaptionCarouselNonAdminProps extends CaptionCarouselBaseProps {
  isAdmin?: false;
  adminClick?: never;
  adminLoading?: never;
  newRoundName?: never;
  setNewRoundName?: never;
  newPlayersAdvancing?: never;
  setNewPlayersAdvancing?: never;
}

type CaptionCarouselProps = CaptionCarouselAdminProps | CaptionCarouselNonAdminProps;

// inspired from https://chakra-templates.vercel.app/page-sections/carousels
export default function CustomCarousel({ cards, isAdmin, adminClick, adminLoading, newRoundName, setNewRoundName, newPlayersAdvancing, setNewPlayersAdvancing }: CaptionCarouselProps) {
  const [slider, setSlider] = React.useState<Slider | null>(null)
  const [currentIndex, setCurrentIndex] = React.useState(0) // track current slide index

  const top = useBreakpointValue({ base: '90%', md: '50%' })
  const side = useBreakpointValue({ base: '30%', md: '40px' })

  const settings = {
    className: "center",
    centerMode: true,
    infinite: false,
    centerPadding: useBreakpointValue({ base: "0px", md: "60px" }),
    dots: true,
    arrows: false,
    fade: false,
    autoplay: false,
    speed: 250,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (_: number, next: number) => {
      setCurrentIndex(Math.floor(next / settings.slidesToShow));
    }
  }

  const adminOnlyModal = isAdmin ? (
    <DialogForm
      title="Add Round"
      trigger={
        <IconButton
          aria-label="add-round"
          variant="ghost"
          loading={adminLoading}
          disabled={adminLoading}
          borderColor="green.solid"
          borderWidth="2px"
          bg="green.600"
          _hover={{ bg: "green.700", borderColor: "green.700" }}
          _active={{ bg: "green.700", borderColor: "green.700" }}
          _focus={{ boxShadow: "outline", bg: "green.600" }}
          {...(cards.length > 0 ? {
            position: "absolute",
            top: top,
            right: side,
            transform: "translate(0%, -50%)",
            zIndex: 2
          } : {})}
        >
          <IoAddCircleSharp />
        </IconButton>
      }
      onSubmit={adminClick}
    >
      {/* Form fields as children */}
      <VStack gap={4} align="stretch">
        <Field.Root>
          <Field.Label>Round Name</Field.Label>
          <Input
            value={newRoundName}
            onChange={(e) => setNewRoundName(e.target.value)}
            placeholder="Enter round name"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Players Advancing</Field.Label>
          <Input
            type="number"
            value={newPlayersAdvancing}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1) {
                setNewPlayersAdvancing(value);
              }
            }}
            placeholder="Enter number of players advancing"
            min={1}
          />
        </Field.Root>
      </VStack>
    </DialogForm>
  ) : null;

  return (
    <Container centerContent>
      <Box position={'relative'} maxW="xl" overflow={'hidden'}>
        {/* Left Icon */}
        {currentIndex + 1 > 1 ? 
          <IconButton
            aria-label="left-arrow"
            variant="ghost"
            position="absolute"
            left={side}
            top={top}
            transform={'translate(0%, -50%)'}
            zIndex={2}
            onClick={() => slider?.slickPrev()}
          >
            <BiLeftArrowAlt size="40px" />
          </IconButton>
          :
          <></>
        }
        {/* Right Icon or Admin Add Button */}
        {currentIndex + 1 < Math.ceil(cards.length / settings.slidesToShow) ? (
          // Normal right arrow when there’s a next slide
          <IconButton
            aria-label="right-arrow"
            variant="ghost"
            position="absolute"
            right={side}
            top={top}
            transform="translate(0%, -50%)"
            zIndex={2}
            onClick={() => slider?.slickNext()}
          >
            <BiRightArrowAlt size="40px" />
          </IconButton>
        ) : (
          // Admin-only Add button when on last slide and user is admin
          isAdmin && adminOnlyModal
        )}

        <Box position="relative" maxW="xl" w="4xl" overflow="hidden">
          {cards.length === 0 && isAdmin ? (
            // Display a centered admin-only Add button when no cards exist
            <Box display="flex" justifyContent="center">
            </Box>
          ) :
            <>
            {/* Slider */}
            <Slider {...settings} ref={(slider) => setSlider(slider)} className="my-slider">
              {cards.map((card, index) => (
                <Box
                  key={index}
                  borderColor="border.emphasized"
                  borderWidth="2px"
                  borderRadius="xl"
                  pb={20}
                  h="auto"
                  w="full"
                >
                  <Container>
                    <VStack gap={6} pt={10} w={'full'} maxW={'full'}>
                      <Heading fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}>
                        {card.title}
                      </Heading>
                      <Box fontSize={{ base: 'sm', lg: 'md' }}>
                        {card.content}
                      </Box>
                    </VStack>
                  </Container>
                </Box>
              ))}
            </Slider>
            {/* Current Index Display — bottom center */}
            <Box position="absolute" bottom="10px" left="50%" transform="translateX(-50%)" color="white" px={2} py={1}
              backgroundColor="bg.panel"
              borderColor="border.muted"
              borderWidth="1px"
              borderRadius="xl"
              fontSize="sm"
              >
              {currentIndex + 1} / {Math.ceil(cards.length / settings.slidesToShow)}
            </Box>
            </>
          }
        </Box>
      </Box>
    </Container>
  )
}