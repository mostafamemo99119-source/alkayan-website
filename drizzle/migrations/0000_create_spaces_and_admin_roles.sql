CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE TABLE public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  eyebrow TEXT NOT NULL CHECK (char_length(eyebrow) BETWEEN 2 AND 120),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 1200),
  capacity TEXT NOT NULL CHECK (char_length(capacity) BETWEEN 1 AND 80),
  price INTEGER NOT NULL CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spaces TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.spaces TO authenticated;
GRANT ALL ON public.spaces TO service_role;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active spaces" ON public.spaces FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert spaces" ON public.spaces FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update spaces" ON public.spaces FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete spaces" ON public.spaces FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.space_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL CHECK (char_length(image_url) BETWEEN 1 AND 2000),
  storage_path TEXT CHECK (storage_path IS NULL OR char_length(storage_path) BETWEEN 1 AND 500),
  alt_text TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.space_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.space_images TO authenticated;
GRANT ALL ON public.space_images TO service_role;
ALTER TABLE public.space_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read images for active spaces" ON public.space_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.spaces s WHERE s.id = space_id AND (s.is_active = true OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Admins can insert space images" ON public.space_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update space images" ON public.space_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete space images" ON public.space_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX spaces_display_order_idx ON public.spaces(display_order, created_at);
CREATE INDEX space_images_space_order_idx ON public.space_images(space_id, display_order);
ALTER PUBLICATION supabase_realtime ADD TABLE public.spaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.space_images;

CREATE POLICY "Admins can upload space images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'space-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update space images storage" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'space-images' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'space-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete space images storage" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'space-images' AND public.has_role(auth.uid(), 'admin'));
