'use strict';
module.exports = function(grunt) {
  // Configuration goes here
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      projectName: 'biblehelper',
      pathToExternal:'../../extrepo',
      pathToInternal:'..'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'src/js/*.js',
        'src/js/vendor/*.js'
      ]
    },
    less: {
      dist: {
        options: {
          compress: true
        },
        files: {
          'dist/css/<%= meta.projectName %>.min.css': [
          'src/less/<%= meta.projectName %>_mods_prod.less',
          '<%= meta.pathToExternal %>/pace/themes/blue/pace-theme-flash.css'
          ]
        }
      },
      dev:{
        options: {
          compress: false
        },
        files: {
          'dist/css/<%= meta.projectName %>.css': [
          'src/less/<%= meta.projectName %>_mods_dev.less',
          '<%= meta.pathToExternal %>/pace/themes/pace-theme-flash.css'
          ]
        }
      }
    },
    uglify: {
       options:{
          banner: '\n' + // banner line size must be preserved
            '/*! <%= pkg.title %> v<%= pkg.version %> | ' +
            '(c) 2014-2016 Greg Tam  */\n'
      },
      dist: {
        files: {
            'dist/js/<%= meta.projectName %>.min.js': [
            '<%= meta.pathToExternal %>/director/build/director.js',
            'src/js/vendor/*.js',
            'src/js/*.js',
            'src/js/mod/default/*.js'
          ]
        }
      },
      dev:{
         options:{
          compress:false,
          beautify:true,
          preserveComments:'all'
         },
         files: {
            'dist/js/<%= meta.projectName %>.js': [
            '<%= meta.pathToExternal %>/director/build/director.js',
            'src/js/vendor/*.js',
            'src/js/*.js',
            'src/js/mod/default/*.js'
          ]
        }
      }
    },
    copy:{
      all:{
        files:[
          {expand: true, cwd: 'src/fonts/', src: ['**'], dest: 'dist/fonts/'},
          {expand: true, cwd: 'src/html/', src: ['**'], dest: 'dist/'},
          {expand: true, cwd: 'src/gfxs/', src: ['**'], dest: 'dist/gfxs/'},
          {expand: true, cwd: 'src/other/', src: ['**'], dest: 'dist/other/'},
          {expand: true, cwd: 'src/js/data/', src: ['**'], dest: 'dist/data/'},
          {expand: true, cwd: 'src/php/', src: ['**'], dest: 'dist/'}
        ]
      }
    },
    watch: {
      less: {
        files: [
          'src/less/*.less',
          '<%= meta.pathToExternal %>/bootstrap/less/*.less'
        ],
        tasks: ['less']
      },
      js: {
        files: [
          '<%= jshint.all %>'
        ],
        tasks: ['jshint', 'uglify']
      }
    },
    clean: {
      dist: [
        'dist/'
      ],
      dev: [
        'dist/'
      ]
    }
  });
  
  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  // Register tasks
  grunt.registerTask('default', [
    'jshint',
    'clean',
    'less',
    'uglify',
    'copy'
  ]);

  grunt.registerTask('watch', [
    'watch'
  ]);
};