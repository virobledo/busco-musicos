-- ---------------------------------------------------------------------------
-- Busco Músicos · datos de demo
--
-- Carga cinco avisos para poder probar el listado, los filtros y el panel de
-- "mis avisos" sin tener que cargarlos a mano. Es opcional: la app funciona
-- perfectamente con la base vacía.
--
-- Antes de correrlo, registrate una vez en /registro: los avisos necesitan un
-- dueño y se cargan a nombre del usuario que elijas abajo.
--
-- Se puede ejecutar más de una vez sin duplicar nada (borra los avisos de demo
-- anteriores del mismo usuario antes de insertar).
--
-- Cuatro quedan activos y uno pausado a propósito: así se ve la diferencia
-- entre el listado público y el panel de /mis-avisos.
-- ---------------------------------------------------------------------------

do $$
declare
  -- Dejalo en null para usar el primer usuario registrado, o poné tu email
  -- entre comillas simples: v_email text := 'vos@ejemplo.com';
  v_email   text := null;
  v_user_id uuid;
begin
  if v_email is null then
    select id into v_user_id from auth.users order by created_at limit 1;
  else
    select id into v_user_id from auth.users where email = lower(v_email);
  end if;

  if v_user_id is null then
    raise exception
      'No encontré ningún usuario. Registrate en /registro y volvé a correr este script.';
  end if;

  -- Los avisos de demo se reconocen por el dominio del email de contacto.
  delete from public.avisos
  where user_id = v_user_id
    and contacto_email like '%@ejemplo.test';

  insert into public.avisos (
    user_id, tipo, titulo, descripcion, instrumento, genero_musical, ubicacion,
    youtube_url, instagram_url,
    contacto_nombre, contacto_email, contacto_telefono, estado
  )
  values
    (
      v_user_id,
      'busco_musico',
      'Banda de rock busca baterista en Villa Crespo',
      'Somos tres (guitarra, bajo y voz), tenemos siete temas propios y sala fija los martes a la noche en Villa Crespo. Buscamos baterista con equipo propio y ganas de tocar en vivo este año. Influencias: Pescado Rabioso, Divididos, Queens of the Stone Age.',
      'Batería',
      'Rock',
      'Villa Crespo, CABA',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      null,
      'Lucía Fernández',
      'lucia@ejemplo.test',
      '+54 9 11 5555-1234',
      'activo'
    ),
    (
      v_user_id,
      'me_ofrezco',
      'Bajista con 10 años de experiencia busca proyecto',
      'Toco bajo desde los quince, vengo de tocar cinco años en una banda de funk que se disolvió el año pasado. Leo cifrado, grabo en casa y tengo movilidad propia. Me interesan proyectos con material original y ensayo semanal. Zona sur o CABA.',
      'Bajo',
      'Funk',
      'Lomas de Zamora, Buenos Aires',
      null,
      'https://instagram.com/ejemplo',
      'Martín Sosa',
      'martin@ejemplo.test',
      null,
      'activo'
    ),
    (
      v_user_id,
      'busco_musico',
      'Cuarteto de tango necesita bandoneonista',
      'Formación estable de tango instrumental con fechas cerradas en dos milongas de San Telmo. Se nos va el bandoneonista por viaje y necesitamos reemplazo para julio. Repertorio clásico (Pugliese, Troilo) más dos arreglos propios. Se paga por fecha.',
      'Bandoneón',
      'Tango',
      'San Telmo, CABA',
      null,
      null,
      'Ernesto Díaz',
      'ernesto@ejemplo.test',
      '011 4444-8899',
      'activo'
    ),
    (
      v_user_id,
      'me_ofrezco',
      'Cantante busca banda de covers para fiestas',
      'Canto hace ocho años, principalmente covers de rock nacional e internacional de los 80 y 90. Tengo repertorio armado de dos horas y equipo de voz propio. Busco banda que haga casamientos y eventos los fines de semana. Disponibilidad completa.',
      'Voz',
      'Covers / Fiestas',
      'Rosario, Santa Fe',
      null,
      null,
      'Carolina Ruiz',
      'carolina@ejemplo.test',
      '+54 9 341 555-7788',
      'activo'
    ),
    (
      v_user_id,
      'busco_musico',
      'Proyecto de electrónica en vivo busca tecladista',
      'Armamos un set de electrónica en vivo con máquinas y sintes, algo entre Caribou y Moderat. Ya tenemos la base rítmica y necesitamos tecladista que se sume a la parte melódica y armónica. Ensayamos en Córdoba capital, los sábados a la tarde.',
      'Teclado',
      'Electrónica',
      'Córdoba Capital, Córdoba',
      null,
      null,
      'Pablo Giménez',
      'pablo@ejemplo.test',
      null,
      'pausado'
    );

  raise notice 'Listo: 5 avisos de demo cargados para el usuario %.', v_user_id;
end
$$;
