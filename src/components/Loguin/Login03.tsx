import React, { useRef, useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styles from './Login03.module.css';
import logo from '../../assets/OcasaLogoSmall.png';

type CarrouselItem = {
  id: number;
  imgUrl: string;
};

const Login03: React.FC = () => {
  const carrouselData: CarrouselItem[] = [
    { id: 1, imgUrl: "https://static.wixstatic.com/media/400291_51d1218e2e8545f59d0c267d75336d01~mv2.jpg/v1/fill/w_614,h_614,al_c,lg_1,q_85,enc_auto/400291_51d1218e2e8545f59d0c267d75336d01~mv2.jpg" },
    { id: 2, imgUrl: "https://static.wixstatic.com/media/400291_38d95df91fb84781876d283fe938ed44~mv2.jpg/v1/fill/w_1024,h_512,al_c,q_85,enc_auto/400291_38d95df91fb84781876d283fe938ed44~mv2.jpg" },
    { id: 3, imgUrl: "https://static.wixstatic.com/media/400291_9762f44b737041739268c573e018de9d~mv2.jpg/v1/fill/w_614,h_614,al_c,lg_1,q_85,enc_auto/400291_9762f44b737041739268c573e018de9d~mv2.jpg" },
    { id: 4, imgUrl: "https://static.wixstatic.com/media/400291_f573080d71fd40258320f2bb429b060a~mv2.jpg/v1/fill/w_614,h_614,al_c,lg_1,q_85,enc_auto/400291_f573080d71fd40258320f2bb429b060a~mv2.jpg" },
    { id: 5, imgUrl: "https://static.wixstatic.com/media/400291_9539cf4aae394ff8a7adf60528e661eb~mv2.jpg/v1/fill/w_1024,h_512,al_c,q_85,enc_auto/400291_9539cf4aae394ff8a7adf60528e661eb~mv2.jpg" }
  ];

  const imgRef = useRef<HTMLUListElement | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    const listNode = imgRef.current;
    if (!listNode) return;
    const images = listNode.querySelectorAll<HTMLImageElement>('li > img');
    const imageNode = images[currentImgIndex];
    if (imageNode) {
      imageNode.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentImgIndex]);

  const goToImg = (imgIdx: number) => {
    setCurrentImgIndex(imgIdx);
  };

  // Avanza automáticamente cada 3s
  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextIndex = (currentImgIndex + 1) % carrouselData.length;
      setCurrentImgIndex(nextIndex);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [currentImgIndex, carrouselData.length]);

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Usuario:', username);
    console.log('Contraseña:', password);
    // agregar lógica real de login aquí
    window.location.href = '/Home';
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.sliderContainer}>
        <div className={styles.imagesContainer}>
          <ul ref={imgRef}>
            {carrouselData.map((image) => (
              <li key={image.id}>
                <img src={image.imgUrl} className={styles.imageCss} alt={`Carousel ${image.id}`} />
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.dotsContainer}>
          {carrouselData.map((_, idx) => (
            <div
              key={idx}
              className={`${styles.dotCss} ${idx === currentImgIndex ? styles.active : ''}`}
              onClick={() => goToImg(idx)}
            >
              &#9864;
            </div>
          ))}
        </div>
      </div>

      <div className={styles.loginForm}>
        <form onSubmit={handleSubmit}>
          <div className={styles.logoTextRow}>
            <h1 className={styles.ocasaTitle}>OCASA</h1>
            {logo && (
              <img src={logo} alt="OCASA Logo" className={styles.ocasaLogo} />
            )}
          </div>

          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={handleUsernameChange}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={handlePasswordChange}
          />
          <button type="submit">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
};

export default Login03;
