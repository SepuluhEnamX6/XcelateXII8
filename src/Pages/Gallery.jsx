import React, { useState, useEffect, useCallback } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ButtonSend from '../components/ButtonSend';
import ButtonRequest from '../components/ButtonRequest';
import Modal from '@mui/material/Modal';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSpring, animated } from '@react-spring/web';
import { supabase } from '../supabaseClient';

const BUCKET = 'foto';

const Carousel = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ fetchGallery dibungkus useCallback supaya bisa dipanggil ulang tanpa re-render berlebih
  const fetchGallery = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error || !data || data.length === 0) {
        setImages([]);
        return;
      }

      const urls = data
        .filter((f) => f.name && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
        .map((f) => {
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
          return urlData.publicUrl;
        });

      setImages(urls);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch pertama kali
    fetchGallery();

    // ✅ Realtime listener — hanya aktif saat ada perubahan di storage.objects
    // Tidak polling, tidak membebani — hanya fired saat INSERT/DELETE
    const channel = supabase
      .channel('gallery-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'storage',
          table: 'objects',
          filter: `bucket_id=eq.${BUCKET}`,
        },
        () => {
          // Fetch ulang hanya saat ada foto baru/dihapus
          fetchGallery();
        },
      )
      .subscribe();

    // Cleanup saat komponen unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGallery]);

  const modalFade = useSpring({ opacity: open ? 1 : 0, config: { duration: 300 } });

  const settings = {
    centerMode: true,
    centerPadding: '30px',
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    responsive: [
      { breakpoint: 768, settings: { arrows: false, centerMode: true, centerPadding: '50px', slidesToShow: 1, dots: false } },
      { breakpoint: 480, settings: { arrows: false, centerMode: true, centerPadding: '70px', slidesToShow: 1, dots: false } },
    ],
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpen(true);
  };
  const handleCloseModal = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
      <div className="text-white opacity-60 text-base font-semibold mb-4 mx-[10%] mt-10 lg:text-center lg:text-3xl lg:mb-8" id="Gallery">
        Class Gallery
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-white opacity-40 text-sm">Memuat galeri...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-white opacity-40 text-sm">Belum ada foto</p>
        </div>
      ) : (
        <div id="Carousel">
          <Slider {...settings}>
            {images.map((imageUrl, index) => (
              <img key={index} src={imageUrl} alt={`Image ${index}`} onClick={() => handleImageClick(imageUrl)} style={{ cursor: 'pointer' }} />
            ))}
          </Slider>
        </div>
      )}

      <div className="flex justify-center items-center gap-6 text-base mt-5 lg:mt-8">
        <ButtonSend />
        <ButtonRequest />
      </div>

      <Modal open={open} onClose={handleCloseModal} aria-labelledby="image-modal" aria-describedby="image-modal-description" className="flex justify-center items-center">
        <animated.div style={{ ...modalFade, maxWidth: '90vw', maxHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }} className="p-2 rounded-lg">
          <IconButton edge="end" color="inherit" onClick={handleCloseModal} aria-label="close" sx={{ position: 'absolute', top: '12px', right: '23px', backgroundColor: 'white', borderRadius: '50%' }}>
            <CloseIcon />
          </IconButton>
          <div className="w-full">
            <img src={selectedImage} alt="Selected Image" style={{ maxWidth: '100%', maxHeight: '100vh' }} />
          </div>
        </animated.div>
      </Modal>
    </>
  );
};

export default Carousel;
