import React from 'react'
import {Box, IconButton, useBreakpointValue, VStack, Heading, Text, Container} from '@chakra-ui/react'
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi'
import Slider from 'react-slick'

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CustomCarousel.css"

import type { CarouselCard } from '../../types/CarouselCard';

interface CaptionCarouselProps {
  cards: CarouselCard[];
}

// inspired from https://chakra-templates.vercel.app/page-sections/carousels
export default function CustomCarousel({ cards }: CaptionCarouselProps) {
  const [slider, setSlider] = React.useState<Slider | null>(null)
  const [currentIndex, setCurrentIndex] = React.useState(0) // track current slide index

  const top = useBreakpointValue({ base: '90%', md: '50%' })
  const side = useBreakpointValue({ base: '30%', md: '40px' })

  const settings = {
    className: "center",
    centerMode: true,
    infinite: false,
    centerPadding: "60px",
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
        {/* Right Icon */}
        {currentIndex + 1 < Math.ceil(cards.length / settings.slidesToShow) ? 
          <IconButton
            aria-label="right-arrow"
            variant="ghost"
            position="absolute"
            right={side}
            top={top}
            transform={'translate(0%, -50%)'}
            zIndex={2}
            onClick={() => slider?.slickNext()}
          >
            <BiRightArrowAlt size="40px" />
          </IconButton>
          :
          <></>
        }

        <Box position="relative" maxW="xl" w="4xl" overflow="hidden">
          {/* Slider */}
          <Slider {...settings} ref={(slider) => setSlider(slider)} className="my-slider">
            {cards.map((card, index) => (
              <Box
              key={index}
              borderColor="border.emphasized"
              borderWidth="2px"
              borderRadius="xl"
              pb={20}
              maxH="300px"
              >
                <Container>
                  <VStack gap={6} pt={10} w={'full'} maxW={'full'}>
                    <Heading fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                      {card.title}
                    </Heading>
                    <Text fontSize={{ base: 'sm', lg: 'md' }}>
                      {card.content}
                    </Text>
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
        </Box>
      </Box>
    </Container>
  )
}