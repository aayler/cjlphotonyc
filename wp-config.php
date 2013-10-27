<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

define('WP_SITEURL', 'http://' . $_SERVER['SERVER_NAME'] . '/cjlphotonyc/wordpress');
define('WP_HOME',    'http://' . $_SERVER['SERVER_NAME'] . '/cjlphotonyc');

define('WP_CONTENT_DIR', $_SERVER['DOCUMENT_ROOT'] . '/cjlphotonyc/wp-content');
define('WP_CONTENT_URL', 'http://' . $_SERVER['SERVER_NAME'] . '/cjlphotonyc/wp-content');

define('WP_DEFAULT_THEME', 'cjl');

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'sosedit1_cjl');

/** MySQL database username */
define('DB_USER', 'sosedit1_cjladmin');

/** MySQL database password */
define('DB_PASSWORD', 'Cjl@dmin');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'Ilc$4Fk*fy:%,0iubA0|kTg*FQfdw=;j:i]-RUn!&%!UK$3xgivwgU?MEns|d/|-');
define('SECURE_AUTH_KEY',  '3z^3]%_[I^wj{~;o`4@ON2vk&K|)>b+3DQri4iU)&dID^XeKh[G`^02Gv<F-krAQ');
define('LOGGED_IN_KEY',    'k-]$Mp/D1I~$l?(+w(5.G}$>NyD7JjB8Cj-NyT`~,ARw.o7OS&o#(# Jmc@Z63^V');
define('NONCE_KEY',        'LmlK<Y9WD8,@%eg0xA6|oe8!-f{tCs:X2pPxI^ZJ#Xz6u/-Tv3i9K@d0|7+|ykf}');
define('AUTH_SALT',        '=X7te]4F76d4&c#?]@iA+n$JIne+/;3NZ`0`(Io+_UcLHm!<3W+=-Bv|]4,(= +D');
define('SECURE_AUTH_SALT', '):%-a/]ef)#0L|&JEKVi_QkYGN OCI;4Hu4FB]5hVr>YC=p1-uDHLvw+#9lG6T[x');
define('LOGGED_IN_SALT',   'E6s@!(8Q*.{k(Q+#P|YS;_,^uK8 STVscw2gcOL1doqu}[(?Eaa-HMJ3mw8`X}cM');
define('NONCE_SALT',       '3|.-.0jXi%@N^]tnY5/I=xqCtTGzLd^]D;f,y+C.Y|3vj}oa[]UY6DyAIu950fuU');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define('WPLANG', '');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
