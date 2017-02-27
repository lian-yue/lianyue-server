import React, { Component, PropTypes } from 'react'
import queryString from 'query-string'
export default class StorageComponent extends Component {
  static contextTypes = {
    onChange: React.PropTypes.func.isRequired,
    fetch: React.PropTypes.func.isRequired,
  }

  static propTypes = {
    multiple: React.PropTypes.bool,
    token: React.PropTypes.object,
    select: React.PropTypes.func,
    className: React.PropTypes.string,
  }

  state = {
    mode: 'html5',
    more: true,
    reset: false,
    tab: 0,
    files: [],
    start: '',
    end: '',
    search: '',
    manual: false,
    loading: false,
    checkeds: [],
  }

  static defaultProps = {
    multiple: true,
    select: () => {

    },
    accept: [
      'image/png',
      'image/gif',
      'image/jpeg',
      'image/webp',
      'image/bmp',
    ],
    className: 'storage-button btn btn-secondary',
  }

  active = false
  checkedLastIndex = -1
  tab = 0
  ltId = ''
  start = ''
  end = ''
  search = ''

  previous = {
    start: '',
    end: '',
    search: '',
    tab: 0,
    lt_id: '',
  };

  onChange = this.context.onChange


  componentDidMount() {
    var input = document.createElement('input');
    input.type = 'file';
    if (!window.FormData || !input.files)  {
      this.setState({mode:'html4'});
    }
  }

  componentDidUpdate() {
    if (this.end != this.state.end || this.start != this.state.start || this.search != this.state.search) {
      this.tab = 0

      this.ltId = ''
      this.start = ''
      this.end = ''
      this.search = ''
    }
    this.end = this.state.end
    this.start = this.state.start
    this.search = this.state.search

    if (this.state.tab == 1 && !this.tab) {
      this.tab = 1
      var files = [];
      for (let i = 0; i < this.state.files.length; i++) {
        let file = this.state.files[i];
        if (file._id) {
          break;
        }
        files.push(file);
      }
      this.setState({files,more:true}, () => {
        this.onLoad();
      });
    }
    if (this.state.show) {
      document.body.className = document.body.className || '';
      if (document.body.className.indexOf('modal-open') == -1) {
        document.body.className += ' modal-open';
      }
    } else if(document.body.className) {
      document.body.className = document.body.className.replace(/(^\s*|\s+)modal-open(\s+|\s*$)/g, '');
    }
  }

  componentWillUnmount() {
    this.willUnmount = true;
    this.active = false;
  }

  async onLoad() {
    if (this.state.loading) {
      return;
    }
    if (!this.state.more) {
      return;
    }
    this.setState({loading: true, manual: false})
    try {
      var result = await this.context.fetch('/storage', {
        start: this.state.start,
        end: this.state.end,
        search:this.state.search,
        lt_id:this.ltId,
        limit:100,
      })
      var files = this.state.files.concat(result.results);
      this.ltId = result.results.length ? result.results[result.results.length - 1]._id : '';
      this.setState({files, more: result.more, loading: false});
    } catch (e) {
      this.setState({manual: true, loading: false});
    }
  }


  onScroll() {
    return (e) => {
      var el = e.target;
      if ((el.scrollTop + el.clientHeight + 300) > el.scrollHeight) {
          this.onLoad();
      }
    }
  }

  onManual() {
    return (e) => {
      e.preventDefault();
      this.onLoad();
    }
  }


  onChangeFile() {
    return (e) => {
      e.preventDefault();
      var el = e.target
      var files = [];
      if (el.files) {
        for (let i = 0; i < el.files.length; i++) {
          let file = el.files[i];
          files.push(this._fileUploadInit({hidden: {file:file, el:el}, size:file.size, name: file.name}));
        }
      } else {
        files.push(this._fileUploadInit({hidden: {el:el},size: -1, name: el.value.replace(/^.*?([^\/\\\r\n]+)$/, '$1')}));
      }
      files = files.concat(this.state.files);
      this.setState({reset: true,tab:1, files}, () => {
        this.setState({reset: false});
        this._onUpload();
      });
    }
  }


  onShow(show) {
    return (e) => {
      e && e.preventDefault();
      this.setState({show: show === undefined ? !this.state.show : show}, () => {
        if (this.state.show) {
          this.refs.dialog.focus();
        }
      });
    }
  }

  onTab(tab) {
    return (e) => {
      e.preventDefault();
      this.setState({tab});
    }
  }

  removeFiles = [];

  removeCount = 0;

  async removeFetch(file) {
    if (file) {
      this.removeFiles.push(file);
    }
    if (!this.removeFiles.length) {
      return;
    }
    if (this.removeCount >= 5) {
      return;
    }
    file = this.removeFiles.pop();
    this.removeCount++
    try {
      await this.context.fetch('/storage/'+ file.id +'/delete', {}, {})
    } catch (e) {
    } finally {
      this.removeFetch();
    }
  }

  onRemove(file) {
    return (e) => {
      e.preventDefault();
      var checkeds = this.state.checkeds;
      var files = this.state.files;

      for (let checked of checkeds) {
        if (checked._id) {
          this.removeFetch(checked);
        } else {
          checked.removed = true;
          if (checked.hidden.xhr) {
            checked.hidden.xhr.abort();
          }
        }
        var index = files.indexOf(checked)
        if (index != -1) {
          files.splice(index, 1);
        }
      }
      this.setState({files,checkeds: []});
    }
  }


  onKeyUp = (e) => {
    if (e.keyCode == 27) {
      e.preventDefault();
      this.setState({show: !this.state.show});
    }
  }


  onSelect() {
    return (e) => {
      e && e.preventDefault();
      if (!this.props.multiple && this.state.checkeds.length > 1) {
        alert('您只能选择一个文件');
        return;
      }
      var checkeds = this.state.checkeds;
      for (let checked of checkeds) {
        if (!checked._id) {
          alert('选择的文件有未完成的');
          return;
        }
      }
      this.setState({show: !this.state.show, checkeds: []});
      this.props.select(this.props.multiple ? checkeds : checkeds[0]);
    }
  }

  onChecked(file) {
    return (e) => {
      e.preventDefault();
      var checkeds = this.state.checkeds;

      if (e.shiftKey && this.checkedLastIndex != -1) {
        let index = this.state.files.indexOf(file);
        let files = this.state.files;
        if (index >= this.checkedLastIndex) {
          files = files.slice(this.checkedLastIndex, index  + 1);
        } else {
          files = files.slice(index, this.checkedLastIndex  + 1);
        }

        for (let i = 0; i < files.length; i++) {
          let file2 = files[i];
          let index = checkeds.indexOf(file2);
          if (index != -1) {
            checkeds.splice(index, 1);
          }
          checkeds.push(file2);
        }
        this.checkedLastIndex = index;
      } else if (e.altKey || e.metaKey) {
        var index = checkeds.indexOf(file);
        if (index == -1) {
          this.checkedLastIndex = this.state.files.indexOf(file);
          checkeds.push(file);
        } else {
          this.checkedLastIndex = -1;
          checkeds.splice(index, 1);
        }
      } else {
        var index = checkeds.indexOf(file);
        if (index == -1) {
          this.checkedLastIndex = this.state.files.indexOf(file);
          checkeds = [file];
        } else {
          checkeds = [];
          this.checkedLastIndex = -1;
        }
      }

      this.setState({checkeds: checkeds});
    }
  }


  onCheckedSelect(file) {
    return (e) => {
      e.preventDefault();
      var checkeds = this.state.checkeds;
      var index = checkeds.indexOf(file);
      if (index == -1) {
        checkeds.push(file);
      }
      this.setState({checkeds: checkeds}, () => {
        this.onSelect()();
      });
    }
  }

  onEnter(e) {
    if(e.keyCode == 13) {
      e.preventDefault();
    }
  }

  onBackdrop = (e) => {
    if (e.target == this.refs.dialog) {
      this.onShow(false)()
    }
  }


  render() {
    return (
      <div className="storage">
        <button type="button" className={this.props.className} onClick={this.onShow()}>{this.props.children || '选择'}</button>
        <div className={"storage-modal modal fade" + (this.state.show ? ' show' : '')} onKeyUp={this.onKeyUp} style={{display: this.state.show ? '' : 'none'}} tabIndex="-1" role="dialog" ref="dialog" onClick={this.onBackdrop}>
          <div className="modal-dialog" role="document" rel="document">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">文件</h3>
                  <button className="close" type="button" title="关闭" onClick={this.onShow()}>
                    <span>×</span>
                  </button>
              </div>
              <div className="modal-body">
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item">
                    <a href="#" className={'nav-link' + (this.state.tab == 0 ? ' active' : '')} onClick={this.onTab(0)}>上传文件</a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className={'nav-link' + (this.state.tab == 1 ? ' active' : '')} onClick={this.onTab(1)}>选择文件</a>
                  </li>
                </ul>
                <div className="tab-content">
                  <div role="tabpanel" className={['tab-pane', 'fade', this.state.tab == 0 ? 'active' : '', this.state.tab == 0 ? ' show' : ''].join(' ')}>
                    <div className="storage-upload">
                      <div className="storage-upload-ui">
                        <label className="btn btn-lg btn-secondary">
                          选择文件
                          {(() => {
                            if (!this.state.reset) {
                              return <input name="file" type="file" onChange={this.onChangeFile()} multiple accept={this.props.accept.length ? this.props.accept.join(',') : false} />
                            } else {
                              return <span></span>
                            }
                          })()}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div role="tabpanel" className={['tab-pane', 'fade', this.state.tab == 1 ? 'active' : '', this.state.tab == 1 ? ' show' : ''].join(' ')}>
                    <div className="storage-toolbar">
                      <div className="storage-date form-inline">
                        <label htmlFor="storage-date-start">时间过滤:</label>
                        <input onKeyDown={this.onEnter} type="date" placeholder="开始日期" id="storage-date-start-input" className="date form-control" name="start" value={this.state.start} onChange={this.onChange('start')} />
                        <span className="line">-</span>
                        <input onKeyDown={this.onEnter} type="date" placeholder="结束日期" id="storage-date-end-input" className="date form-control" name="end" value={this.state.end} onChange={this.onChange('end')} />
                      </div>
                      <div className="storage-search form-inline">
                        <label htmlFor="storage-search-input">搜索:</label>
                        <input onKeyDown={this.onEnter} type="search" placeholder="搜索" id="storage-search-input" className="search form-control" name="search" onChange={this.onChange('search', 400)} />
                      </div>
                    </div>
                    <div className="storage-attachments" onScroll={this.onScroll()}>
                      <ul>
                        {this.state.files.map((file) => {
                          if (file._id) {
                            return (
                              <li className={['storage-attachment', this.state.checkeds.indexOf(file) == -1 ? '' : 'attachment-checked'].join(' ')} key={file.id} onClick={this.onChecked(file)} onDoubleClick={this.onCheckedSelect(file)}>
                                <div className={["thumbnail", file.thumbnail ? 'thumbnail-img' : 'thumbnail-icon'].join(' ')}>
                                  <div className="centered">
                                    {(() => {
                                      if (file.thumbnail) {
                                        return <img src={file.thumbnail} title={file.name} />
                                      } else {
                                        return <i className="fa fa-5x fa-file"></i>
                                      }
                                    })()}
                                  </div>
                                </div>
                                <div className="name" title={file.name}>{file.name}</div>
                              </li>
                            )
                          }
                          return (
                            <li className={['storage-attachment-upload', this.state.checkeds.indexOf(file) == -1 ? '' : 'attachment-checked'].join(' ')} key={file.id} onClick={this.onChecked(file)}>
                              <div className="thumbnail thumbnail-icon">
                                <div className="centered">
                                  <i className="fa fa-5x fa-file"></i>
                                  {(() => {
                                    if (file.error) {
                                      return <div className="error">{file.error}</div>
                                    } else {
                                      return (
                                        <progress className="progress" value={file.progress} max="100">
                                          <div className="progress">
                                            <div className="progress-bar progress-bar-striped" style={{width: file.progress +'%'}}></div>
                                          </div>
                                        </progress>
                                      )
                                    }
                                  })()}
                                </div>
                              </div>
                              <div className="name" title={file.name}>{file.name}</div>
                            </li>
                          )
                        })}
                      </ul>
                      <div className="load">
                        <div className="loading" style={{display: this.state.loading ? '' : 'none'}}>
                          <div className="circle"></div>
                        </div>
                        <div className="manual" style={{display: this.state.manual ? '' : 'none'}}>
                          <div className="">载入失败请<a href="#" onClick={this.onManual()}>重试</a></div>
                        </div>
                        <div className="loaded" style={{display: this.state.more ? 'none' : ''}}>
                          <div className="">文件已加载完毕</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={this.onRemove()} className={"btn btn-danger" + (this.state.checkeds.length ? '' : ' disabled')}>删除所选</button>
                <button type="button" onClick={this.onSelect()}  className={"btn btn-primary"  + (this.state.checkeds.length ? '' : ' disabled')}>确认选择</button>
              </div>
            </div>
          </div>
        </div>
        <div className={"modal-backdrop fade" + (this.state.show ? ' show' : '')}></div>
      </div>
    )
  }

  _fileUploadInit(file) {
    file = Object.assign({
      id: Math.random().toString(36).substr(2),
      size: -1,
      name: 'Filename',
      progress: '0.00',
      speed: 0,
      active: false,
      error: '',
      active: false,
      success: false,
    }, file);
    return file;
  }

  _onUpload() {
    if (this.active) {
      return false;
    }
    this.active = true;
    var file;
    for (let i = 0; i < this.state.files.length; i++) {
      let file2 = this.state.files[i];
      if (file2._id || file2.error) {
        break;
      }
      file = this.state.files[i];
    }
    if (!file) {
      this.active = false;
      return;
    }

    if (file.size >= (1024 * 1024 * 20)) {
      file.error = '文件过大'
      this._onUpload();
      return;
    }

    if (this.state.mode = 'html5') {
      this._onUploadHtml5(file);
    } else {
      this._onUploadHtml4(file);
    }
  }
  _onUploadHtml5(file) {
    var form = new window.FormData();
    form.append('file', file.hidden.file);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/storage/create?view=json&_token=' + this.props.token._id);
    this._fileUploadXhr(xhr, file, form);
  }

  _onUploadHtml4(file) {
    var keydown = function(e) {
      if (e.keyCode == 27) {
        e.preventDefault();
      }
    }
    var fileUploads = false;


    var iframe = document.createElement('iframe');
    iframe.id = 'upload-iframe-' + file.id;
    iframe.name = 'upload-iframe-' + file.id;
    iframe.src = 'about:blank';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.position = 'absolute';
    iframe.style.marginTop = '-9999em';

    var form = document.createElement('form');
    form.action = '/storage/create?view=json&_token=' + this.props.token._id;
    form.name = 'upload-form-' + file.id;
    form.setAttribute('method', 'POST');
    form.setAttribute('target', 'upload-iframe-' + file.id);
    form.setAttribute('enctype', 'multipart/form-data');
    form.appendChild(file.hidden.el);

    var input = document.createElement('input');
    input.type = 'hidden';
    input.name =  '_token';
    input.value = this.props.token._id;
    form.appendChild(input);

    var getDocumentData = function() {
      var doc;
      try {
        if (iframe.contentWindow) {
          doc = iframe.contentWindow.document;
        }
      } catch(err) {
      }
      if (!doc) {
        try {
          doc = iframe.contentDocument ? iframe.contentDocument : iframe.document;
        } catch(err) {
          doc = iframe.document;
        }
      }
      if (doc && doc.body) {
        return doc.body.innerHTML;
      }
      return null;
    }




    var callback = (e) => {
      var files = this.state.files;
      switch (e.type) {
        case 'abort':
          file.error = '上传终止';
          break;
        case 'error':
          var data = getDocumentData();
          if (file.error) {
          } else if (data === null) {
            file.error = '网络错误';
          } else {
            file.error = '服务器错误';
          }
          break;
        default:
          var data = getDocumentData();
          if (file.error) {
          } else if (data === null) {
            file.error = '网络错误';
          } else if (!data) {
            file.error = '相应数据错误';
            file.progress = '100.00';
          } else {
            file.progress = '100.00';
            file.success = true;
          }
      }
      file.active = false;
      if (data) {
        try {
          data = JSON.parse(data.replace(/^\<\w+\s*.*?\>(.+)\<\s*\/\s*\w+\>$/, '$1'));
          if (data.messages && data.messages.length) {
            file.error = data.messages[0].message;
            file.success = false;
          } else {
            for (let name in file) {
              delete file[name];
            }
            for (let name in data) {
              file[name] = data[name];
            }
          }
        } catch (err) {
          file.success = false;
          file.error = err.message;
        }
      }
      if (!fileUploads) {
        document.body.removeEventListener('keydown', keydown);
        fileUploads = true;
        iframe.parentNode && iframe.parentNode.removeChild(iframe);
        if (!this.willUnmount) {
          this.setState({files}, () => {
            if (this.active) {
              this.active = false;
              setTimeout(() => {
                this._onUpload();
              }, 50);
            }
          });
        }
      }
    }


    setTimeout(() => {
      document.body.appendChild(iframe).appendChild(form).submit();
      iframe.onload = callback;
      iframe.onerror = callback;
      iframe.onabort = callback;
      file.active = true;
      file.hidden.iframe = iframe;
      document.body.addEventListener('keydown', keydown);
      var interval = setInterval(() => {
        if (!this.active || !file.active || file.success || file.error) {
          clearInterval(interval);
          if (!file.success && !file.error) {
            iframe.onabort({type:'abort'});
          }
        }
      }, 50);
    }, 10);
  }




  _fileUploadXhr(xhr, file, data) {
    var speedTime = 0;
    var speedLoaded = 0;
    xhr.upload.onprogress = (e) => {
      if (file.removed) {
        xhr.abort();
        return;
      }
      if (!this.active || !file.active) {
        xhr.abort();
        return;
      }

      if (e.lengthComputable) {
        var speedTime2 = Math.round(Date.now() / 1000);
        if (speedTime2 != speedTime) {
          file.progress = (e.loaded / e.total * 100).toFixed(2);
          file.speed = e.loaded - speedLoaded;
          this.setState({files: this.state.files});
          speedLoaded = e.loaded;
          speedTime = speedTime2;
        }
      }
    };


    var callback = (e) => {
      var files = this.state.files;
      switch (e.type) {
        case 'timeout':
          file.error = '上传超时';
          break;
        case 'abort':
          file.error = '上传终止';
          break;
        case 'error':
          if (!xhr.status) {
            file.error = '网络错误';
          } else if(xhr.status >= 500) {
            file.error = '服务器错误';
          } else if (xhr.status >= 400) {
            file.error = '请求错误请刷新重试';
          }
          break;
        default:
          if(xhr.status >= 500) {
            file.error = '服务器错误';
          } else if (xhr.status >= 400) {
            file.error = '请求错误请刷新重试';
          } else {
            file.progress = '100.00';
            file.success = true;
          }
      }

      file.active = false;
      if (xhr.responseText) {
        let data = JSON.parse(xhr.responseText);
        if (data.messages && data.messages.length) {
          file.error = data.messages[0].message;
          file.success = false;
        } else {
          for (let name in file) {
            delete file[name];
          }
          for (let name in data) {
            file[name] = data[name];
          }
        }
      }
      if (!this.willUnmount) {
        this.setState({files}, () => {
          if (this.active) {
            this.active = false;
            this._onUpload();
          }
        });
      }
    }

    xhr.onload = callback;
    xhr.onerror = callback;
    xhr.onabort = callback;
    xhr.ontimeout = callback;
    xhr.timeout = 1000 * 300;
    xhr.send(data);


    file.active = true;
    file.hidden.xhr = xhr;

    var interval = setInterval(() => {
      if (!this.active || !file.active || file.success || file.error) {
        clearInterval(interval);
        if (!file.success && !file.error) {
          xhr.abort();
        }
      }
    }, 100);
  }
}
