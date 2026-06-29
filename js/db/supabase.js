import { createClient as _supabaseCreateClient } from '@supabase/supabase-js';

SICP.supabaseDB = (function() {
  var client = null;
  var _user = null;
  var _syncStatus = 'disconnected';

  function getClient() {
    if (client) return client;
    if (!SICP.CONFIG.USE_SUPABASE || !SICP.CONFIG.SUPABASE_URL || !SICP.CONFIG.SUPABASE_ANON_KEY) {
      _syncStatus = 'no-config';
      return null;
    }
    try {
      if (typeof _supabaseCreateClient === 'function') {
        client = _supabaseCreateClient(SICP.CONFIG.SUPABASE_URL, SICP.CONFIG.SUPABASE_ANON_KEY);
      } else if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        client = window.supabase.createClient(SICP.CONFIG.SUPABASE_URL, SICP.CONFIG.SUPABASE_ANON_KEY);
      } else {
        _syncStatus = 'no-config';
        return null;
      }
      _syncStatus = 'connected';
      return client;
    } catch(e) {
      _syncStatus = 'error';
      return null;
    }
  }

  function getSyncStatus() { return _syncStatus; }

  function _mapRow(row) {
    if (!row) return null;
    var out = {};
    for (var k in row) {
      var jsKey = k.replace(/_([a-z])/g, function(g) { return g[1].toUpperCase(); });
      out[jsKey] = row[k];
    }
    return out;
  }

  function _mapToDb(obj) {
    var out = {};
    for (var k in obj) {
      if (k === 'id' || k === 'fechaCreacion') continue;
      var dbKey = k.replace(/([A-Z])/g, function(g) { return '_' + g[0].toLowerCase(); });
      out[dbKey] = obj[k];
    }
    return out;
  }

  function signIn(email, password) {
    var c = getClient();
    if (!c) return Promise.reject(new Error('Supabase no configurado'));
    return c.auth.signInWithPassword({ email: email, password: password }).then(function(resp) {
      if (resp.error) throw resp.error;
      _user = resp.data.user;
      _syncStatus = 'authenticated';
      return _user;
    });
  }

  function signUp(email, password) {
    var c = getClient();
    if (!c) return Promise.reject(new Error('Supabase no configurado'));
    return c.auth.signUp({ email: email, password: password }).then(function(resp) {
      if (resp.error) throw resp.error;
      return resp.data.user;
    });
  }

  function signOut() {
    var c = getClient();
    _user = null;
    _syncStatus = 'connected';
    if (c) return c.auth.signOut();
    return Promise.resolve();
  }

  function getUser() { return _user; }

  function _userId() {
    if (!_user) throw new Error('No autenticado');
    return _user.id;
  }

  function syncPull() {
    var c = getClient();
    if (!c || !_user) return Promise.reject(new Error('No autenticado'));
    _syncStatus = 'syncing';
    var uid = _userId();
    return Promise.all([
      c.from('productos').select('*').eq('user_id', uid),
      c.from('metas').select('*').eq('user_id', uid),
      c.from('evidencias').select('*').eq('user_id', uid),
      c.from('profiles').select('*').eq('id', uid).single()
    ]).then(function(results) {
      var pRows = results[0].data || [];
      var mRows = results[1].data || [];
      var eRows = results[2].data || [];
      var profile = results[3].data ? _mapRow(results[3].data) : null;
      var local = SICP.localDB.get();
      local.productos = pRows.map(_mapRow);
      local.metas = mRows.map(_mapRow);
      local.evidencias = eRows.map(_mapRow);
      if (profile) {
        local.perfil = Object.assign({}, local.perfil, profile);
        if (profile.config) {
          try { local.config = Object.assign({}, local.config, typeof profile.config === 'string' ? JSON.parse(profile.config) : profile.config); }
          catch(e) {}
        }
      }
      SICP.localDB.save();
      _syncStatus = 'authenticated';
      return { productos: local.productos.length, metas: local.metas.length, evidencias: local.evidencias.length };
    }).catch(function(err) {
      _syncStatus = 'error';
      throw err;
    });
  }

  function syncPush() {
    var c = getClient();
    if (!c || !_user) return Promise.reject(new Error('No autenticado'));
    _syncStatus = 'syncing';
    var uid = _userId();
    var data = SICP.localDB.get();

    function upsertAll(table, rows, mapFn) {
      if (!rows || !rows.length) return Promise.resolve();
      var mapped = rows.map(function(r) {
        var m = mapFn ? mapFn(r) : _mapToDb(r);
        m.user_id = uid;
        return m;
      });
      return c.from(table).upsert(mapped, { onConflict: 'id' });
    }

    return Promise.all([
      upsertAll('productos', data.productos),
      upsertAll('metas', data.metas),
      upsertAll('evidencias', data.evidencias),
      c.from('profiles').upsert({
        id: uid,
        nombre: data.perfil.nombre || '',
        institucion: data.perfil.institucion || '',
        area: data.perfil.area || 'Ciencias Sociales',
        linea_investigacion: data.perfil.lineaInvestigacion || '',
        orcid: data.perfil.orcid || '',
        scholar: data.perfil.scholar || '',
        cvu: data.perfil.cvu || '',
        nivel_actual: data.perfil.nivelActual || 'Candidato',
        meta_snii: data.perfil.metaSNII || 'Nivel I',
        config: JSON.stringify(data.config || {})
      }, { onConflict: 'id' })
    ]).then(function() {
      _syncStatus = 'authenticated';
      return { synced: true };
    }).catch(function(err) {
      _syncStatus = 'error';
      throw err;
    });
  }

  return {
    getClient: getClient, getSyncStatus: getSyncStatus,
    signIn: signIn, signUp: signUp, signOut: signOut, getUser: getUser,
    syncPull: syncPull, syncPush: syncPush
  };
})();
