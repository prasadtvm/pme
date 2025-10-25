

CREATE TABLE IF NOT EXISTS public.checklists
(
    id SERIAL NOT NULL,
    project_id integer,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    selected boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT checklists_pkey PRIMARY KEY (id),
    CONSTRAINT checklists_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.hotels
(
    id SERIAL NOT NULL,
    project_id integer,
    sponsor character varying(255) COLLATE pg_catalog."default" NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    selected boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hotels_pkey PRIMARY KEY (id),
    CONSTRAINT hotels_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.associates
(
    id integer NOT NULL DEFAULT nextval('associates_id_seq'::regclass),
    project_id integer,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    selected boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT associates_pkey PRIMARY KEY (id),
    CONSTRAINT associates_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS public.av_setup
(
    id integer NOT NULL DEFAULT nextval('av_setup_id_seq'::regclass),
    project_id integer,
    backdrop text COLLATE pg_catalog."default",
    screen text COLLATE pg_catalog."default",
    mic text COLLATE pg_catalog."default",
    projector text COLLATE pg_catalog."default",
    stage text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT av_setup_pkey PRIMARY KEY (id),
    CONSTRAINT av_setup_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.client
(
    id integer NOT NULL DEFAULT nextval('client_id_seq'::regclass),
    project_id integer,
    delegate text COLLATE pg_catalog."default",
    accommodation text COLLATE pg_catalog."default",
    accommodation_contact text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT client_pkey PRIMARY KEY (id),
    CONSTRAINT client_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)




CREATE TABLE IF NOT EXISTS public.embassy
(
    id integer NOT NULL DEFAULT nextval('embassy_id_seq'::regclass),
    project_id integer,
    cheif_guest text COLLATE pg_catalog."default",
    cheif_guest_designation text COLLATE pg_catalog."default",
    accommodation_contact text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cheif_guest_phone text COLLATE pg_catalog."default",
accomodation_contract text COLLATE pg_catalog."default",
accomomdation_address text COLLATE pg_catalog."default",
accommodation_phone text COLLATE pg_catalog."default",
    CONSTRAINT embassy_pkey PRIMARY KEY (id),
    CONSTRAINT embassy_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.menu_files
(
    id integer NOT NULL DEFAULT nextval('menu_files_id_seq'::regclass),
    project_id integer,
    filename character varying(255) COLLATE pg_catalog."default",
    file_path text COLLATE pg_catalog."default",
    file_size integer,
    mime_type character varying(100) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT menu_files_pkey PRIMARY KEY (id),
    CONSTRAINT menu_files_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)
CREATE TABLE IF NOT EXISTS public.project_details
(
    id integer NOT NULL DEFAULT nextval('project_details_id_seq'::regclass),
    project_id integer,
    roadshow_name character varying(255) COLLATE pg_catalog."default",
    city character varying(100) COLLATE pg_catalog."default",   
   image_file text COLLATE pg_catalog."default",
event_date date NOT NULL,
  
    budget numeric(15,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
   
    CONSTRAINT project_details_pkey PRIMARY KEY (id),
    CONSTRAINT project_details_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.projects
(
    id integer NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    image_file 
    //description text COLLATE pg_catalog."default",
    //year integer NOT NULL,
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'draft'::character varying,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT projects_pkey PRIMARY KEY (id),
    CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.rsvp
(
    id integer NOT NULL DEFAULT nextval('rsvp_id_seq'::regclass),
    project_id integer,
    date date,
    nos integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rsvp_pkey PRIMARY KEY (id),
    CONSTRAINT rsvp_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.rsvp (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    invitation_design_file_path TEXT, -- Single file upload for invitation design
    save_the_date DATE, -- Save the Date
    save_the_date_confirmation_date DATE,
    save_the_date_ta_nos INTEGER DEFAULT 0,
    save_the_date_to_nos INTEGER DEFAULT 0,
    save_the_date_travel_counsellors_nos INTEGER DEFAULT 0,
    save_the_date_influencers_nos INTEGER DEFAULT 0,
    save_the_date_total_nos INTEGER DEFAULT 0,
    
    main_invitation_date DATE, -- Main Invitation
    main_invitation_confirmation_date DATE,
    main_invitation_ta_nos INTEGER DEFAULT 0,
    main_invitation_to_nos INTEGER DEFAULT 0,
    main_invitation_travel_counsellors_nos INTEGER DEFAULT 0,
    main_invitation_influencers_nos INTEGER DEFAULT 0,
    main_invitation_total_nos INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rsvp_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id)
);

CREATE TABLE IF NOT EXISTS public.trade_database
(
    id integer NOT NULL DEFAULT nextval('trade_database_id_seq'::regclass),
    project_id integer,
    trade_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    nos integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT trade_database_pkey PRIMARY KEY (id),
    CONSTRAINT trade_database_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role smallint,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
)

CREATE TABLE IF NOT EXISTS public.venues
(
    id integer NOT NULL DEFAULT nextval('venues_id_seq'::regclass),
    project_id integer,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,      
 currency VARCHAR(10),
 rate NUMERIC;
    budget numeric(15,2),
    selected boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT venues_pkey PRIMARY KEY (id),
    CONSTRAINT venues_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.projects (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.remark
(
    id SERIAL PRIMARY KEY,
    project_id INTEGER,
    remarktext VARCHAR(255) NOT NULL,
    userid INTEGER,
    isapproved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    adminapproved_date  DATE;,
    CONSTRAINT remark_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.project (id)  -- fixed reference
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);