// src/serviceWorkerRegistration.js

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
      // [::1] é o localhost do IPv6.
      window.location.hostname === '[::1]' ||
      // 127.0.0.0/8 é considerado localhost para IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/
      )
  );
  
  export function register() {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      // O construtor URL está disponível em todos os browsers que suportam SW.
      const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        // Se o app estiver em outro domínio, ignore.
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        if (isLocalhost) {
          // Executa no localhost
          checkValidServiceWorker(swUrl);
          navigator.serviceWorker.ready.then(() => {
            console.log('Este app está sendo executado em modo localhost. SW rodando.');
          });
        } else {
          // Registra SW em produção
          registerValidSW(swUrl);
        }
      });
    }
  }
  
  function registerValidSW(swUrl) {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration);
  
        // A cada updatefound, podemos identificar se há nova versão do SW
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Novo conteúdo está disponível
                console.log('Novo conteúdo está disponível; por favor feche as abas para atualizar.');
              } else {
                // Conteúdo em cache para uso offline
                console.log('Conteúdo em cache para uso offline.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('Erro ao registrar o Service Worker:', error);
      });
  }
  
  function checkValidServiceWorker(swUrl) {
    // Verifica se o SW pode ser encontrado
    fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
      .then((response) => {
        const contentType = response.headers.get('content-type');
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf('javascript') === -1)
        ) {
          // SW não encontrado. Provavelmente outro app ocupando a URL.
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          // SW encontrado. Prossiga com o registro.
          registerValidSW(swUrl);
        }
      })
      .catch(() => {
        console.log('Sem conexão à internet. App rodando em modo offline.');
      });
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }
  