/* ==========================================================================
   WEBAS ECOSYSTEM v2.0 - MATRIZ DE CHECKOUT DIRECTO Y PRECIOS REGIONALES (2026)
   Botones de Acción Directa a Checkout (Garantir Plano / Obtener Plan)
   ========================================================================== */

var CONFIG_REGIONAL = window.CONFIG_REGIONAL || {
  "webas.es": {
    marca: "WEBAS",
    dominio: "webas.es",
    pais: "España 🇪🇸",
    taglineHeader: "PÁGINAS WEB DE PRESENTACIÓN • ESPAÑA 🇪🇸",
    emailContacto: "hola@webas.es",
    whatsappActivo: false,
    checkoutAutoUrl: "pago.html?site=webas.es&plan=pro",
    
    // Sección 1: Hero
    heroBadge: "🚀 PÁGINAS WEB DE PRESENTACIÓN LISTAS EN 5 A 10 DÍAS HÁBILES",
    heroHeadline: "La página web que tu negocio necesita para captar clientes desde el móvil, con precio fijo y entregada en 5 días",
    heroSub: "Presenta tus servicios de forma clara y profesional. Sin reuniones eternas ni presupuestos inflados: te ayudamos a conseguir solicitudes de presupuesto cada semana.",
    heroBtnPrimary: "🚀 Garantizar Plan Pro Recomendado (347 €)",
    heroBtnSec: "Ver Proceso en 3 Pasos",
    heroTrust: "✓ Proceso claro • Entrega garantizada en 5-10 días • Sin costos ocultos",

    // Sección 2: El Problema
    probTitle: "¿Tu negocio pierde clientes por no tener una presencia web clara en el móvil?",
    probSub: "El 85% de tus compradores te buscan desde el teléfono. Si no entienden tu propuesta en 5 segundos, se van a la competencia.",
    probCard1Title: "Sin Web Profesional",
    probCard1Text: "Dependes solo de redes sociales o recomendaciones. Los clientes potenciales dudan de tu profesionalidad.",
    probCard2Title: "Tu Web No Convierte",
    probCard2Text: "Tienes un sitio lento o lleno de texto complicado. Las visitas entran pero nadie te solicita presupuesto.",
    probCard3Title: "Malas Experiencias Previas",
    probCard3Text: "Freelancers o agencias que tardaron meses, cobraron extra por sorpresas o entregaron páginas difíciles de usar.",

    // Sección 3: La Solución
    solTitle: "Construimos tu canal directo de captación de clientes",
    solSub: "Nos enfocamos en el resultado comercial de tu negocio, con lenguaje humano y sin complicaciones.",
    solCard1Title: "🎯 Mensaje Claro",
    solCard1Text: "Explicamos de inmediato qué vendes y por qué deben elegirte.",
    solCard2Title: "📱 Pensada para el Móvil",
    solCard2Text: "Diseñada para la pantalla táctil del móvil donde navega el 85% de tus compradores.",
    solCard3Title: "⚡ Carga Ultra-Rápida",
    solCard3Text: "Optimización técnica para que la página abra en menos de 1.5 segundos.",

    // Sección 4: Cómo Funciona
    procTitle: "Tu web lista en 3 pasos transparentes",
    procSub: "Sin reuniones eternas ni pérdida de tiempo. Un proceso ágil y estructurado.",
    procStep1Title: "Briefing Simple",
    procStep1Text: "Rellenas un formulario simple de 10 minutos con la info de tu negocio y tus objetivos.",
    procStep2Title: "Diseño & Redacción",
    procStep2Text: "Diseñamos la estructura, redactamos los textos persuasivos e integramos tus formularios.",
    procStep3Title: "Publicación & Entrega",
    procStep3Text: "Conectamos tu dominio, probamos los formularios y dejamos la web lista para recibir solicitudes.",

    // Sección 5: Precios (Botones de Acción Directa a Pago)
    priceTitle: "Precios fijos sin sorpresas ni letra pequeña",
    priceSub: "Planes diseñados para cada etapa de tu negocio.",
    planLowTitle: "Landing Express",
    planLowSub: "Ideal para validar servicios rápidamente con 1 pantalla simple.",
    planLowPrecio: "197 €",
    planLowBtn: "🚀 Garantizar Plan Express (197€)",
    
    planProTitle: "Web Pro Conversión",
    planProSub: "Estructura completa de 12 secciones lista para captar clientes.",
    planProPrecio: "347 €",
    planProBtn: "💳 Pagar y Garantizar Plan Pro (347€)",

    planPremTitle: "Ecosistema 360",
    planPremSub: "Web Pro + Quiz Perfilador + Automatización de Consultas.",
    planPremPrecio: "697 €",
    planPremBtn: "🚀 Garantizar Ecosistema 360 (697€)",

    // Sección 6: Diferenciales
    difTitle: "Por qué elegir WEBAS vs agencias tradicionales",
    difCard1Title: "⏱️ Entregas a Tiempo",
    difCard1Text: "Cumplimos el plazo pactado en el contrato. Sin excusas ni semanas de retraso.",
    difCard2Title: "💰 Precio Fijo Cerrado",
    difCard2Text: "Sabes exactamente cuánto vas a invertir desde el primer día. Cero sorpresas.",
    difCard3Title: "📈 Enfoque en Ventas",
    difCard3Text: "No hacemos páginas bonitas pero vacías. Diseñamos estructuras que cierran contratos.",

    // Sección 7: Resultados
    resTitle: "Métricas que respaldan nuestro trabajo",
    resVal1: "+120", resLab1: "Webs Entregadas",
    resVal2: "3.2x", resLab2: "Aumento Promedio de Consultas",
    resVal3: "100%", resLab3: "Cumplimiento de Plazos",
    resVal4: "3 Países", resLab4: "España, Argentina y Brasil",

    // Sección 8: Portfolio
    portTitle: "Proyectos recientes optimizados para conversión",

    // Sección 9: FAQ
    faqTitle: "Todo lo que necesitas saber antes de empezar",

    // Sección 10: Garantía
    garTitle: "Garantía de Plazo y Calidad",
    garSub: "Si no entregamos tu página dentro de los días hábiles estipulados en el contrato, te bonificamos el 20% del valor total de tu proyecto.",

    // Sección 11: CTA Final
    ctaTitle: "¿Listo para impulsar las ventas de tu negocio?",
    ctaSub: "Déjanos tus datos y te enviaremos una propuesta personalizada sin compromiso en menos de 24 horas.",

    // Sección 12: Footer
    footDesc: "Agencia especializada en desarrollo de páginas web de presentación orientadas a conversión.",
    footCob: "España 🇪🇸 • Argentina 🇦🇷 • Brasil 🇧🇷"
  },

  "metodoas.es": {
    marca: "MÉTODO AS",
    dominio: "metodoas.es",
    pais: "España 🇪🇸 | Formación",
    taglineHeader: "ESTRATEGIA Y VENTAS DIGITALES • ESPAÑA 🇪🇸",
    emailContacto: "cursos@metodoas.es",
    whatsappActivo: false,
    checkoutAutoUrl: "pago.html?site=metodoas.es&plan=pro",

    // Sección 1: Hero
    heroBadge: "🎓 FORMACIÓN PRÁCTICA EN ESTRATEGIA Y VENTAS DIGITALES",
    heroHeadline: "Aprende a construir el camino de ventas para tu negocio con el Método AS",
    heroSub: "Formación práctica en estrategia digital y diseño para el móvil sin perder tiempo ni complicarte con código.",
    heroBtnPrimary: "🎓 Inscribirme al Método AS (197 €)",
    heroBtnSec: "Ver Temario del Método AS",
    heroTrust: "✓ Metodología paso a paso • Plantillas reutilizables • Acceso directo",

    // Sección 2: El Problema
    probTitle: "¿Por qué el 90% de los negocios no consiguen clientes por internet?",
    probSub: "Falta de un método estructurado de captación y copias genéricas que nadie lee.",
    probCard1Title: "Sin Estrategia de Mensaje",
    probCard1Text: "Publican sin entender el dolor ni el deseo de su comprador ideal.",
    probCard2Title: "Diseños Desconectados",
    probCard2Text: "Páginas con textos largos que no llevan a la acción inmediata.",
    probCard3Title: "Falta de Plantillas Probadas",
    probCard3Text: "Reinventar la rueda en cada proyecto perdiendo tiempo y dinero.",

    // Sección 3: La Solución
    solTitle: "El Sistema del Método AS",
    solSub: "Aprende a ejecutar las 9 etapas con plantillas reales y guía directa.",
    solCard1Title: "🎓 Copywriting Persuasivo",
    solCard1Text: "Redacción directa que habla el idioma de tu comprador.",
    solCard2Title: "📱 Arquitectura Mobile-First",
    solCard2Text: "Estructuras probadas en dispositivos móviles.",
    solCard3Title: "⚡ Ejecución Rápida",
    solCard3Text: "Publica tus proyectos en días y no en meses.",

    // Sección 4: Cómo Funciona
    procTitle: "El temario práctico en 3 módulos",
    procSub: "Aprende aplicando directamente a tu negocio.",
    procStep1Title: "Módulo 1: Perfilado del Cliente",
    procStep1Text: "Definición del cliente ideal y redactado de la propuesta de valor.",
    procStep2Title: "Módulo 2: Arquitectura y Wireframe",
    procStep2Text: "Maquetación táctil y diseño enfocado a conversión.",
    procStep3Title: "Módulo 3: Publicación y Cierre",
    procStep3Text: "Integración de canales y lanzamiento al mercado.",

    // Sección 5: Precios (Charm Pricing 97€ / 197€ / 397€)
    priceTitle: "Inversión en tu Formación",
    priceSub: "Acceso inmediato al programa y plantillas.",
    planLowTitle: "Taller Starter",
    planLowSub: "Acceso al módulo 1 y plantillas esenciales.",
    planLowPrecio: "97 €",
    planLowBtn: "🚀 Comprar Taller Starter (97€)",
    planProTitle: "Programa Método AS Pro",
    planProSub: "Curso completo de 3 módulos + Plantillas maestras.",
    planProPrecio: "197 €",
    planProBtn: "💳 Comprar Programa Pro (197€)",
    planPremTitle: "Programa Pro + Mentoría 1 a 1",
    planPremSub: "Curso completo + Revisión directa de tus landings.",
    planPremPrecio: "397 €",
    planPremBtn: "🚀 Comprar Programa + Mentoría (397€)",

    // Sección 6: Diferenciales
    difTitle: "Por qué formarse con el Método AS",
    difCard1Title: "🎓 100% Práctico",
    difCard1Text: "Sin teoría de relleno. Todo orientado a construir tu canal de ventas.",
    difCard2Title: "📁 Plantillas Incluidas",
    difCard2Text: "Acceso al repositorio de documentos y wireframes probados.",
    difCard3Title: "🚀 Soporte Directo",
    difCard3Text: "Respuesta a dudas de implementación durante el curso.",

    // Sección 7: Resultados
    resTitle: "Resultados de Alumnos",
    resVal1: "+350", resLab1: "Alumnos Formados",
    resVal2: "98%", resLab2: "Satisfacción con la Metodología",
    resVal3: "100%", resLab3: "Enfoque Práctico",
    resVal4: "5 Estrellas", resLab4: "Valoración Media",

    // Sección 8: Portfolio
    portTitle: "Casos de éxito de alumnos",

    // Sección 9: FAQ
    faqTitle: "Preguntas frecuentes sobre la formación",

    // Sección 10: Garantía
    garTitle: "Garantía de Satisfacción",
    garSub: "Si durante los primeros 7 días consideras que la formación no aporta valor a tu negocio, te devolvemos el 100% de tu dinero.",

    // Sección 11: CTA Final
    ctaTitle: "¿Listo para dominar la captación de clientes?",
    ctaSub: "Solicita tu plaza en el programa y empieza hoy mismo.",

    // Sección 12: Footer
    footDesc: "Programa de formación práctica en ventas digitales y diseño para el móvil.",
    footCob: "España 🇪🇸 • Modalidad 100% Online"
  },

  "ofertasweb.com.ar": {
    marca: "OFERTASWEB",
    dominio: "ofertasweb.com.ar",
    pais: "Argentina 🇦🇷",
    taglineHeader: "PÁGINAS WEB SIMPLES EN 5 DÍAS • ARGENTINA 🇦🇷",
    emailContacto: "contacto@ofertasweb.com.ar",
    whatsappNumero: "5492664266442",
    whatsappMensaje: "Hola! Vi la página de OfertasWeb y quiero consultar por una web simple para mi negocio...",
    whatsappLink: "https://wa.me/5492664266442?text=Hola!%20Vi%20la%20p%C3%A1gina%20de%20OfertasWeb...",
    canalPrincipal: "Página de Pago Directa / WhatsApp",
    whatsappActivo: true,
    checkoutAutoUrl: "pago.html?site=ofertasweb.com.ar&plan=pro",

    // Sección 1: Hero
    heroBadge: "🚀 PÁGINAS WEB SIMPLES LISTAS EN 5 DÍAS HÁBILES",
    heroHeadline: "Hacé que tu negocio se vea profesional en el celular y recibí consultas todos los días por WhatsApp",
    heroSub: "Sin reuniones eternas ni presupuestos inflados: tu página web simple, clara y lista en 5 días pensada para que te escriban directo al teléfono.",
    heroBtnPrimary: "💳 Obtener Web Pro ($349.000 ARS)",
    heroBtnSec: "Ver Proceso en 3 Pasos",
    heroTrust: "✓ Proceso claro • Entrega garantizada en 5 días • Sin costos ocultos",

    // Sección 2: El Problema
    probTitle: "¿Tu negocio pierde clientes por no tener una presencia web clara en el celular?",
    probSub: "El 85% de tus compradores te buscan desde el teléfono. Si no entienden tu propuesta en 5 segundos, se van a la competencia.",
    probCard1Title: "Sin Web Profesional",
    probCard1Text: "Dependés solo de redes sociales o boca en boca. Los clientes potenciales dudan de tu profesionalismo.",
    probCard2Title: "Tu Web No Vende",
    probCard2Text: "Tenés un sitio lento o lleno de texto complicado. Las visitas entran pero nadie te envía un mensaje.",
    probCard3Title: "Malas Experiencias Previas",
    probCard3Text: "Freelancers o agencias que demoraron meses, cobraron extra por sorpresas o entregaron páginas difíciles de usar.",

    // Sección 3: La Solución
    solTitle: "Construimos tu canal directo de captación de clientes",
    solSub: "Nos enfocamos en el resultado comercial de tu negocio, con lenguaje humano y sin complicaciones.",
    solCard1Title: "🎯 Mensaje Claro",
    solCard1Text: "Explicamos de inmediato qué vendés y por qué deben elegirte.",
    solCard2Title: "📱 Pensada para el Celular",
    solCard2Text: "Diseñada para la pantalla táctil del celular donde navega el 85% de tus compradores.",
    solCard3Title: "⚡ Carga Ultra-Rápida",
    solCard3Text: "Optimización técnica para que la página abra en menos de 1.5 segundos.",

    // Sección 4: Cómo Funciona
    procTitle: "Tu web lista en 3 pasos transparentes",
    procSub: "Sin reuniones eternas ni pérdida de tiempo. Un proceso ágil y estructurado.",
    procStep1Title: "Briefing Simple",
    procStep1Text: "Completás un formulario simple de 10 minutos con la info de tu negocio y tus objetivos.",
    procStep2Title: "Diseño & Redacción",
    procStep2Text: "Diseñamos la estructura, redactamos los textos persuasivos e integramos tus botones de contacto.",
    procStep3Title: "Publicación & Entrega",
    procStep3Text: "Conectamos tu dominio, probamos los formularios y dejamos la web lista para recibir consultas.",

    // Sección 5: Precios (Botones de Acción Directa a Pago en Argentina)
    priceTitle: "Precios fijos sin sorpresas ni letra chica",
    priceSub: "Planes diseñados para cada etapa de tu negocio.",
    planLowTitle: "Web Exprès WhatsApp",
    planLowSub: "1 pantalla simple y directa a WhatsApp para validar ya.",
    planLowPrecio: "$199.000 ARS",
    planLowBtn: "🚀 Obtener Plan Exprès ($199k)",

    planProTitle: "Web Pro Conversión",
    planProSub: "Estructura completa de 12 secciones + Botones MP y WhatsApp.",
    planProPrecio: "$350.000 ARS",
    planProBtn: "💳 Pagar y Obtener Plan Pro ($349k)",

    planPremTitle: "Sistema Pyme 360",
    planPremSub: "Web Pro + Quiz Perfilador + Automatización de Respuestas.",
    planPremPrecio: "$699.000 ARS",
    planPremBtn: "🚀 Obtener Sistema Pyme 360 ($699k)",

    // Sección 6: Diferenciales
    difTitle: "Por qué elegir OfertasWeb vs agencias tradicionales",
    difCard1Title: "⏱️ Entregas a Tiempo",
    difCard1Text: "Cumplimos la fecha pactada en el contrato. Sin excusas ni semanas de atraso.",
    difCard2Title: "💰 Precio Fijo Cerrado",
    difCard2Text: "Sabés exactamente cuánto vas a invertir desde el primer día. Cero sorpresas.",
    difCard3Title: "📈 Enfoque en Ventas",
    difCard3Text: "No hacemos páginas lindas pero vacías. Diseñamos estructuras que cierran contratos.",

    // Sección 7: Resultados
    resTitle: "Métricas que respaldan nuestro trabajo",
    resVal1: "+120", resLab1: "Webs Entregadas",
    resVal2: "3.2x", resLab2: "Aumento Promedio de Consultas",
    resVal3: "100%", resLab3: "Cumplimiento de Fechas",
    resVal4: "3 Países", resLab4: "España, Argentina y Brasil",

    // Sección 8: Portfolio
    portTitle: "Proyectos recientes optimizados para conversión",

    // Sección 9: FAQ
    faqTitle: "Todo lo que necesitás saber antes de empezar",

    // Sección 10: Garantía
    garTitle: "Garantía de Plazo y Calidad",
    garSub: "Si no entregamos tu página dentro de los días hábiles estipulados en el contrato, te bonificamos el 20% del valor total de tu proyecto.",

    // Sección 11: CTA Final
    ctaTitle: "¿Listo para impulsar las ventas de tu negocio?",
    ctaSub: "Dejanos tus datos o realizá tu pago seguro online.",

    // Sección 12: Footer
    footDesc: "Agencia especializada en páginas web simples de venta directa conectadas a WhatsApp.",
    footCob: "España 🇪🇸 • Argentina 🇦🇷 • Brasil 🇧🇷"
  },

  "digitalmas.pro": {
    marca: "DIGITALMAS.PRO",
    dominio: "digitalmas.pro",
    pais: "Brasil 🇧🇷",
    taglineHeader: "PÁGINAS DE VENDAS NO CELULAR • BRASIL 🇧🇷",
    emailContacto: "contato@digitalmas.pro",
    whatsappNumero: "5555997120149",
    whatsappMensaje: "Olá! Vi o site da DigitalMas e gostaria de solicitar um orçamento simples para o meu negócio...",
    whatsappLink: "https://wa.me/5555997120149?text=Ol%C3%A1!%20Vi%20o%20site%20da%20DigitalMas...",
    canalPrincipal: "Página de Pagamento Direto / WhatsApp",
    whatsappActivo: true,
    checkoutAutoUrl: "pago.html?site=digitalmas.pro&plan=pro",

    // Sección 1: Hero
    heroBadge: "🚀 PÁGINAS DE VENDAS DIRETAS PRONTAS EM 5 DIAS ÚTEIS",
    heroHeadline: "Tenha uma página simples no celular que leva clientes direto para o seu WhatsApp todos os dias",
    heroSub: "Sua estrutura de vendas pronta em 5 dias para destacar seu negócio da concorrência e transformar visitantes em contatos reais.",
    heroBtnPrimary: "💳 Garantir Página Pro (R$ 797)",
    heroBtnSec: "Ver Processo em 3 Passos",
    heroTrust: "✓ Processo claro • Entrega garantida em 5 dias • Sem custos escondidos",

    // Sección 2: O Problema
    probTitle: "O seu negócio está perdendo clientes por não ter uma página clara no celular?",
    probSub: "85% dos seus compradores procuram você pelo celular. Se eles não entenderem sua proposta em 5 segundos, vão para o concorrente.",
    probCard1Title: "Sem Página Profissional",
    probCard1Text: "Você depende apenas de redes sociais ou indicações. Os clientes potenciais duvidam do seu profissionalismo.",
    probCard2Title: "Sua Página Não Vende",
    probCard2Text: "Você tem um site lento ou cheio de textos complicados. As pessoas entram, mas ninguém manda mensagem.",
    probCard3Title: "Experiências Ruins Anteriores",
    probCard3Text: "Freelancers ou agências que demoraram meses, cobraram taxas surpresa ou entregaram sites difíceis de mexer.",

    // Sección 3: A Solução DigitalMás
    solTitle: "Criamos o seu canal direto de vendas e contatos",
    solSub: "Focamos no resultado comercial do seu negócio, com linguagem humana e sem complicação.",
    solCard1Title: "🎯 Mensagem Clara",
    solCard1Text: "Explicamos imediatamente o que você vende e por que devem escolher você.",
    solCard2Title: "📱 Feita para o Celular",
    solCard2Text: "Desenhada para a tela sensível ao toque do celular, onde navegam 85% dos seus clientes.",
    solCard3Title: "⚡ Carregamento Ultra-Rápido",
    solCard3Text: "Otimização técnica para a página abrir em menos de 1,5 segundo.",

    // Sección 4: Como Funciona
    procTitle: "Sua página pronta em 3 passos simples",
    procSub: "Sem reuniões infinitas nem perda de tempo. Um processo ágil e direto ao ponto.",
    procStep1Title: "Formulário Simples",
    procStep1Text: "Você preenche um formulário rápido de 10 minutos com as informações e fotos do seu negócio.",
    procStep2Title: "Design & Redação",
    procStep2Text: "Criamos a estrutura visual, escrevemos os textos persuasivos e conectamos seus botões de contato.",
    procStep3Title: "Publicação & Entrega",
    procStep3Text: "Conectamos o seu domínio, testamos os links do WhatsApp e entregamos a página pronta para vender.",

    // Sección 5: Preços e Planos (Botones de Acción Directa a Pago en Brasil)
    priceTitle: "Preços fixos sem surpresas nem letrinhas miúdas",
    priceSub: "Planos sob medida para o momento do seu negócio.",
    planLowTitle: "Página Express WhatsApp",
    planLowSub: "Estrutura enxuta de 1 tela (ou 12x de R$ 49,70 no cartão).",
    planLowPrecio: "R$ 497 BRL",
    planLowBtn: "🚀 Garantir Plano Express (R$ 497)",

    planProTitle: "Página Pro Vendas",
    planProSub: "Estrutura completa de 12 seções (ou 12x de R$ 79,70 no cartão).",
    planProPrecio: "R$ 797 BRL",
    planProBtn: "💳 Pagar e Garantir Plano Pro (R$ 797)",

    planPremTitle: "Ecossistema Vendas 360",
    planPremSub: "Página Pro + Quiz Filtrador (ou 12x de R$ 179,70 no cartão).",
    planPremPrecio: "R$ 1.797 BRL",
    planPremBtn: "🚀 Garantir Ecossistema 360 (R$ 1.797)",

    // Sección 6: Diferenciais
    difTitle: "Por que escolher a DigitalMás vs agências tradicionais",
    difCard1Title: "⏱️ Entrega no Prazo",
    difCard1Text: "Cumprimos rigorosamente o prazo combinado. Sem desculpas nem semanas de atraso.",
    difCard2Title: "💰 Preço Fixo Fechado",
    difCard2Text: "Você sabe exatamente quanto vai investir desde o primeiro dia. Zero surpresas.",
    difCard3Title: "📈 Foco em Vendas",
    difCard3Text: "Não fazemos páginas bonitas mas vazias. Criamos estruturas feitas para gerar orçamentos.",

    // Sección 7: Resultados
    resTitle: "Resultados que comprovam nosso trabalho",
    resVal1: "+120", resLab1: "Páginas Entregues",
    resVal2: "3.2x", resLab2: "Aumento Médio de Mensagens",
    resVal3: "100%", resLab3: "Cumprimento de Prazos",
    resVal4: "3 Países", resLab4: "Espanha, Argentina e Brasil",

    // Sección 8: Portfolio
    portTitle: "Projetos recentes otimizados para vendas",

    // Sección 9: FAQ
    faqTitle: "Tudo o que você precisa saber antes de começar",

    // Sección 10: Garantia
    garTitle: "Garantia de Prazo e Qualidade",
    garSub: "Se não entregarmos sua página dentro do prazo combinado no contrato, damos 20% de desconto no valor total do seu projeto.",

    // Sección 11: CTA Final
    ctaTitle: "Pronto para aumentar as vendas do seu negócio?",
    ctaSub: "Fale conosco no WhatsApp ou faça seu pagamento seguro online.",

    // Sección 12: Footer
    footDesc: "Agência especializada em páginas de vendas feitas para o celular com foco em WhatsApp.",
    footCob: "Espanha 🇪🇸 • Argentina 🇦🇷 • Brasil 🇧🇷"
  }
};

console.log("Matriz v2.0 de Checkout Directo e Precios Regionales Cargada.");
