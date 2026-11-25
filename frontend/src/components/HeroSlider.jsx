'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const slider = useRef(null);
  const playing = !paused;
  useEffect(() => {
    const headerElements = [...document.querySelectorAll('.topbar, .site-header')];
    const fitBelowHeader = () => {
      const headerHeight = headerElements.reduce(
        (height, element) => height + element.getBoundingClientRect().height,
        0,
      );
      slider.current?.style.setProperty('--hero-header-height', `${headerHeight}px`);
    };
    fitBelowHeader();
    const observer = new ResizeObserver(fitBelowHeader);
    headerElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playing, slides.length]);
  const go = (delta) => setIndex((i) => (i + delta + slides.length) % slides.length);
  const arrowKeys = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      go(event.key === 'ArrowRight' ? 1 : -1);
    }
  };
  if (!slides.length) return null;

  return (
    <div
      className="hero-slider"
      ref={slider}
      role="region"
      aria-roledescription="carousel"
      aria-label="Packaging and print showcase"
    >
      <div className="hero-slider__stage">
        {slides.map((image, i) => (
          <div
            key={image.src}
            className={`hero-slide ${i === index ? 'is-active' : ''}`}
            aria-hidden={i !== index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            {(i === 0 || prepared || i === index) && (
              <div className="hero-slide__image">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  loading={i === 0 || i === index ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  onLoad={i === 0 ? () => setPrepared(true) : undefined}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button
            className="hero-slider__arrow hero-slider__arrow--previous"
            onKeyDown={arrowKeys}
            aria-label="Previous slide"
            onClick={() => go(-1)}
          >
            <ArrowLeft size={22} />
          </button>
          <button
            className="hero-slider__arrow hero-slider__arrow--next"
            onKeyDown={arrowKeys}
            aria-label="Next slide"
            onClick={() => go(1)}
          >
            <ArrowRight size={22} />
          </button>
        </>
      )}
      <div className="slider-controls">
        <span className="slider-count">
          {String(index + 1).padStart(2, '0')}{' '}
          <span>/ {String(slides.length).padStart(2, '0')}</span>
        </span>
        <div className="slider-dots" role="group" aria-label="Choose a slide">
          {slides.map((slide, i) => (
            <button
              onKeyDown={arrowKeys}
              key={slide.src}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              className={i === index ? 'is-active' : ''}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="slider-buttons">
          <button
            onKeyDown={arrowKeys}
            aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
            onClick={() => setPaused(playing)}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
