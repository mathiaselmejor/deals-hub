import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo DealsHub trata tus datos personales, cookies y analytics.",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">Política de privacidad</h1>
      <p className="mt-4 text-slate-400">Última actualización: mayo 2026</p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-slate-300">
        <h2 className="text-lg font-semibold text-white">1. Responsable</h2>
        <p>
          DealsHub España es un comparador de ofertas. Para consultas sobre privacidad puedes
          contactarnos a través del correo asociado a tu cuenta de administrador.
        </p>

        <h2 className="text-lg font-semibold text-white">2. Datos que recogemos</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Email, nombre y foto si inicias sesión (Google, GitHub o enlace mágico vía Supabase Auth).</li>
          <li>Favoritos y alertas de precio que guardes en tu cuenta.</li>
          <li>Señales de uso anónimas o vinculadas: páginas vistas, búsquedas, clics en tiendas.</li>
          <li>Cookie de sesión analítica local (<code className="text-indigo-300">dealshub-session</code>).</li>
        </ul>

        <h2 className="text-lg font-semibold text-white">3. Finalidad</h2>
        <p>
          Autenticación, personalizar recomendaciones, medir tráfico, optimizar ofertas y
          cumplir obligaciones de programas de afiliados (atribución de clics).
        </p>

        <h2 className="text-lg font-semibold text-white">4. Enlaces de afiliado</h2>
        <p>
          Al pulsar «Comprar» o «Ir a tienda» serás redirigido a sitios externos (Amazon, Awin,
          etc.). Esas tiendas tienen sus propias políticas. DealsHub puede recibir comisión sin
          coste extra para ti.
        </p>

        <h2 className="text-lg font-semibold text-white">5. Conservación y seguridad</h2>
        <p>
          Los datos se almacenan en Supabase (UE). Aplicamos Row Level Security para que solo
          veas tus favoritos y alertas. Los administradores acceden a estadísticas agregadas.
        </p>

        <h2 className="text-lg font-semibold text-white">6. Tus derechos</h2>
        <p>
          Puedes eliminar favoritos y alertas desde tu cuenta, cerrar sesión o solicitar borrado
          de tu perfil contactando al administrador (RGPD: acceso, rectificación, supresión).
        </p>

        <h2 className="text-lg font-semibold text-white">7. Cookies</h2>
        <p>
          Usamos cookies técnicas de autenticación y una preferencia local de consentimiento.
          Puedes rechazar cookies no esenciales no usando la web o borrando datos del navegador.
        </p>
      </section>

      <Link href="/" className="mt-10 inline-block text-indigo-400 hover:underline">
        ← Volver al inicio
      </Link>
    </div>
  );
}
