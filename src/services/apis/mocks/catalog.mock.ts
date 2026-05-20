import { DashboardCatalogViewModel } from '../models/dashboard-catalog-view-model'

// Carta ficticia estilo restaurante mediterraneo moderno (Barcelona vibes)
// Se usa en dev cuando el backend no devuelve catalogo
export const mockCatalog = DashboardCatalogViewModel.fromJS({
  catalogId: 'mock-catalog',
  categories: [
    {
      id: 'cat-entrantes',
      name: 'Entrantes',
      items: [
        { id: 'e-01', name: 'Pan de cristal con tomate', description: 'Pan de cristal tostado con tomate rallado, aceite de oliva virgen extra y sal Maldon.', price: 4.50 },
        { id: 'e-02', name: 'Croquetas de jamon iberico', description: 'Bechamel cremosa con jamon iberico de bellota. 6 unidades.', price: 9.80 },
        { id: 'e-03', name: 'Burrata con tomates confitados', description: 'Burrata cremosa, tomates cherry confitados a baja temperatura, pesto y crujiente de pan.', price: 12.50 },
        { id: 'e-04', name: 'Tartar de atun rojo', description: 'Atun rojo del Mediterraneo, aguacate, soja, sesamo tostado y toque de lima.', price: 14.90 },
        { id: 'e-05', name: 'Ensaladilla premium', description: 'Patata, huevo de corral, atun de almadraba, mayonesa casera y huevas de trucha.', price: 8.50 },
      ]
    },
    {
      id: 'cat-para-compartir',
      name: 'Para compartir',
      items: [
        { id: 's-01', name: 'Tabla de embutidos ibericos', description: 'Jamon 5J, lomo, salchichon y chorizo iberico, picos y pan con tomate.', price: 22.00 },
        { id: 's-02', name: 'Tabla de quesos artesanos', description: 'Seleccion de 5 quesos nacionales con confituras, frutos secos y pan de pasas.', price: 19.50 },
        { id: 's-03', name: 'Pulpo a la brasa', description: 'Pulpo gallego a la brasa, puree de patata ahumada, pimenton de la Vera y aceite de oliva.', price: 18.90 },
        { id: 's-04', name: 'Tabla del mar', description: 'Boquerones, anchoa 00, mejillones en escabeche y berberechos. Ideal para dos.', price: 24.00 },
      ]
    },
    {
      id: 'cat-arroces',
      name: 'Arroces',
      items: [
        { id: 'a-01', name: 'Paella mixta tradicional', description: 'Pollo de corral, conejo, judia verde, garrofon, azafran y aceite de oliva. Min 2 pax.', price: 19.50 },
        { id: 'a-02', name: 'Arroz negro con calamar', description: 'Arroz bomba con tinta de calamar fresco, sepia y alioli de ajo asado.', price: 21.00 },
        { id: 'a-03', name: 'Arroz a banda con all i oli', description: 'Arroz meloso de pescado de roca, gambas rojas y all i oli suave.', price: 22.50 },
        { id: 'a-04', name: 'Fideua de mariscos', description: 'Fideo fino, gambas, mejillones, almejas y calamar. Con all i oli aparte.', price: 20.00 },
      ]
    },
    {
      id: 'cat-principales',
      name: 'Principales',
      items: [
        { id: 'p-01', name: 'Chuleton de vaca madurada', description: 'Chuleton de vaca rubia gallega madurada 45 dias a la brasa, patatas panaderas y pimientos.', price: 32.00 },
        { id: 'p-02', name: 'Magret de pato con frutos rojos', description: 'Magret de pato a baja temperatura, reduccion de vino tinto y frutos rojos, cuscus de coliflor.', price: 24.50 },
        { id: 'p-03', name: 'Bacalao confitado a la brasa', description: 'Lomo de bacalao confitado en aceite de oliva, pil-pil y verduras asadas.', price: 23.80 },
        { id: 'p-04', name: 'Rissoto de setas y trufa', description: 'Arborio con boletus y shiitake salteados, parmesano 24 meses y aceite de trufa blanca.', price: 19.50 },
        { id: 'p-05', name: 'Solomillo Wellington', description: 'Solomillo iberico envuelto en hojaldre con duxelle de champinones y salsa perigord.', price: 28.00 },
        { id: 'p-06', name: 'Lubina salvaje a la espalda', description: 'Lubina abierta y cocinada a la espalda con ajo, perejil y limon. Patatas panaderas.', price: 26.50 },
      ]
    },
    {
      id: 'cat-postres',
      name: 'Postres',
      items: [
        { id: 'd-01', name: 'Coulant de chocolate 70%', description: 'Bizcocho tibio con corazon fundente, helado de vainilla bourbon y sal en escamas.', price: 7.50 },
        { id: 'd-02', name: 'Crema catalana tradicional', description: 'Crema catalana caramelizada al momento con azucar moreno y canela.', price: 6.50 },
        { id: 'd-03', name: 'Cheesecake de queso de cabra', description: 'Tarta de queso de cabra con mermelada de higos y galleta de almendras.', price: 7.00 },
        { id: 'd-04', name: 'Sorbete de limon al cava', description: 'Sorbete natural de limon con chupito de cava brut. Refrescante.', price: 5.50 },
        { id: 'd-05', name: 'Tiramisu de pistacho', description: 'Version de tiramisu clasico con pistacho siciliano y mascarpone.', price: 7.80 },
      ]
    },
    {
      id: 'cat-bebidas',
      name: 'Bebidas',
      items: [
        { id: 'b-01', name: 'Agua mineral', description: 'Botella 75cl, con o sin gas.', price: 3.50 },
        { id: 'b-03', name: 'Cerveza artesana local', description: 'IPA o rubia tostada, 33cl.', price: 4.80 },
        { id: 'b-04', name: 'Sangría de cava', description: 'Sangría de cava con frutos rojos y menta. Jarra 1L.', price: 14.00 },
        { id: 'b-05', name: 'Café de especialidad', description: 'Café de origen, extracción espresso o filtrado.', price: 2.80 },
      ]
    },
    // Vinos uses the 2-level hierarchy: parent has NO items, children carry them.
    { id: 'cat-vinos', name: 'Vinos', items: [] },
    {
      id: 'cat-vinos-blanco',
      name: 'Vino blanco',
      parentCategoryId: 'cat-vinos',
      items: [
        { id: 'v-b-01', name: 'Albariño Pazo de Señoráns', description: 'Rías Baixas DO · 2022. Fresco, mineral, notas cítricas.', price: 28.00 },
        { id: 'v-b-02', name: 'Verdejo Naia', description: 'Rueda DO · 2023. Aromático, con final tropical.', price: 22.00 },
        { id: 'v-b-03', name: 'Chardonnay Enate 234', description: 'Somontano DO · 2022. Cuerpo medio, paso en barrica.', price: 24.00 },
      ]
    },
    {
      id: 'cat-vinos-tinto',
      name: 'Vino tinto',
      parentCategoryId: 'cat-vinos',
      items: [
        { id: 'v-t-01', name: 'Ribera del Duero Crianza', description: 'Bodegas Emilio Moro · 2020. Tempranillo 100%, 18 meses barrica.', price: 35.00 },
        { id: 'v-t-02', name: 'Rioja Reserva', description: 'Marqués de Murrieta · 2018. Frutos negros, especias y vainilla.', price: 42.00 },
        { id: 'v-t-03', name: 'Garnacha del Priorat', description: 'Clos Mogador · 2021. Concentrado, mineral, gran estructura.', price: 48.00 },
      ]
    },
    {
      id: 'cat-vinos-rosado',
      name: 'Vino rosado',
      parentCategoryId: 'cat-vinos',
      items: [
        { id: 'v-r-01', name: 'Provence Rosé', description: 'Côtes de Provence · 2023. Pálido, seco, fresa silvestre.', price: 26.00 },
        { id: 'v-r-02', name: 'Garnacha rosada de Navarra', description: 'Bodegas Ochoa · 2023. Frutal, ligero, ideal para aperitivo.', price: 18.00 },
      ]
    },
    {
      id: 'cat-menus',
      name: 'Combos',
      items: [
        { id: 'combo-1', name: 'Menú del día', description: '1er Entrante + 1 Principal + 1 Postre + bebida + café. Lunes a viernes al mediodía.', price: 16.90 },
        { id: 'combo-2', name: 'Menú degustación', description: '5 pases: entrante, para compartir, arroz, principal y postre. Maridaje opcional (+15€).', price: 38.00 },
        { id: 'combo-3', name: 'Menú grupos', description: 'Selección de 3 para compartir + 2 principales + 2 postres. Mínimo 6 personas.', price: 29.50 },
      ]
    }
  ]
})
