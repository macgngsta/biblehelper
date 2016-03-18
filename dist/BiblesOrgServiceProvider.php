<?php

//we're only gonna support a couple of versions
//niv, nasb, nlt, esv
define('BIBLE_VERSION_ESV','eng-ESV');
define('BIBLE_VERSION_NASB','eng-NASB');
define('BIBLE_VERSION_NIV','eng-NIV');
define('BIBLES_ORG_HOST','https://bibles.org/v2/');
define('ACTION_PASSAGE','/passages.xml');
define('QUERY_PARAM','?q[]=');

//auth token
$token='36NT2lwh34HPd1tOg4rqLYE7wt2Wh6gdbWeCKi7D';

//default to esv
$version=BIBLE_VERSION_ESV;
$query="";

//seems like only esv and nasb are available
if(isset($_GET['version'])){
	$version=BiblesOrgServiceProvider::checkVersion($_GET['version']);
}

if(isset($_GET['query'])){
	$query=BiblesOrgServiceProvider::cleanQuery($_GET['query']);
}

$bibleService = new BiblesOrgServiceProvider($token);
$bibleService->execute($version, $query);
$bibleService->render();

//------------------------------------
// BibleOrgServiceProvider CLASS
//------------------------------------ 
class BiblesOrgServiceProvider {

	protected $_token;
	protected $_rawResponse;
	protected $_extractedResponse;
	protected $_renderedResponse;
	protected $_isError;
	protected $_errorMessage;

	//------------------------------------
    // CONSTRUCTOR
    //------------------------------------ 
    
	public function __construct($token){ 
         $this->_token = $token;
         $this->_rawResponse = null;
         $this->_extractedResponse = null;
         $this->_renderedResponse = "";
         $this->_isError = false;
         $this->_errorMessage = "";
    } 

	public function execute($version,$query){
		$url = $this->buildQuery($version,$query);

		if(!empty($url)){
			$curlH=new CurlHelper($url, '', '', false, $this->_token);
			$curlH->execute();
			$extractedObj = $this->readXml($curlH);

            //var_dump($extractedObj);
            //die;

			if(!empty($extractedObj)){
				$this->_extractedResponse=$extractedObj;
			}
			else{
				$this->_isError=true;
				$this->_errorMessage="could not extract response";
			}
		}
	}

	private function readXml($curlH){
		$bPassages=array();
		$resp = null;
		$sCode = CurlHelper::checkHttpStatus($curlH->getHttpStatus());
		switch($sCode)
		{
			case constant("STATUS_SUCCESS"):
				$resp = simplexml_load_string($curlH->getResponse(),'SimpleXMLElement', LIBXML_NOCDATA);
			break;
			case constant("STATUS_CLIENT_ERROR"):
				$this->_isError=true;
				$this->_errorMessage="request was invalid";
			break;
			case constant("STATUS_SERVER_ERROR"):
				$this->_isError=true;
				$this->_errorMessage="server encountered an error";
			break;
			case constant("STATUS_UNKNOWN_ERROR"):
			default:
				$this->_isError=true;
				$this->_errorMessage="something awful happened";
		}

		if(!empty($resp)){
			$this->_rawResponse=$resp;
			$result = $resp->search->result;
			if(!empty($result)){
				//was too early on the first try
				$passages = $result->passages->passage;
				if(!empty($passages)){
					foreach($passages as $passage){
						if(!empty($passage)){
							$bpObject = new BiblePassageObject();
							$bpObject->set_display($passage->display);
							$bpObject->set_version($passage->version);
							$bpObject->set_textStr($passage->text);
							$bpObject->set_copyright($passage->copyright);
							$bpObject->set_fums($resp->meta->fums);

							$bPassages[]=$bpObject;
						}
						else{
							$this->_isError=true;
							$this->_errorMessage="passage was empty";
						}
					}
				}
			}
			else{
				$this->_isError=true;
				$this->_errorMessage="result set was empty";
			}
		}

		return $bPassages;
	}

	public function render(){
		$respStr="";

		if($this->_isError){
			$respStr=$this->_errorMessage;
		}
		else{
			if(!empty($this->_extractedResponse)){
				
				$isFirst=true;
				$respStr="<br/>";
				$ccText="";

				foreach($this->_extractedResponse as $passage){
					if($isFirst){
						$isFirst=false;
						$ccText.="<small class='text-muted'>";
						$ccText.=$passage->get_copyright();
						$ccText.="</small>";
					}
					$respStr.="<blockquote class=\"blockquote-reverse\"><p class=\"lead text-info\">";
					$respStr.=$passage->get_display();
					$respStr.="</p></blockquote>";
					$respStr.=$passage->get_textStr();
					$respStr.="<hr>";
				}

				$respStr.=$ccText;

				$this->_renderedResponse=$respStr;
			}
		}

		echo $respStr;
	}

	private function buildQuery($version, $query){
		$url="";

		if(!empty($version) && !empty($query)){
			$url=BIBLES_ORG_HOST.$version.ACTION_PASSAGE.QUERY_PARAM;
			$url.=$query;
		}
		
		return $url;
	}

	public static function checkVersion($versionNum){
		$version = BIBLE_VERSION_ESV;

		if(!empty($versionNum)){
			switch($versionNum){
				case 1:
					$version=BIBLE_VERSION_ESV;
					break;
				case 2:
					$version=BIBLE_VERSION_NASB;
					break;
				default:
					//no change, default to esv
			}
		}

		return $version;
    }

    public static function cleanQuery($query){
		$queryClean = "";

		if(!empty($query)){
			$queryClean=strtolower($query);

			$exhaustiveBookQuery ='';

			//contains a -
			if(strpos($queryClean,'-')!==false){

                //need to handle 1 samuel 1-3
                //and later psalms 119:1-30
                
                $book = explode(' ', $queryClean);
                if(!empty($book)){
                    $len = count($book);
                    
                    $prefix="";
                    $theBook="";
                    $remainder="";
                    $chapters="";
                    $sCh=0;
                    $eCh=0;
                    $verses="";
                    
                    if($len==3){
                        $prefix=$book[0];
                        $theBook=$book[1];
                        $remainder=$book[2];
                    }
                    else if($len==2){
                        $theBook=$book[0];
                        $remainder=$book[1];
                    }
                    else{
                        //couldnt parse
                    }
                    
                    //explode verses
                    $chVerses = explode(':',$remainder);
                    
                    if(!empty($chVerses)){
                        $len2 = count($chVerses);
                        
                        if($len2 == 1){
                            //no verses
                            $chapters=$chVerses[0];
                        }
                        else if($len2 == 2){
                            //verses
                            $chapters=$chVerses[0];
                            $verses=$chVerses[1];
                        }
                        else{
                            //couldnt parse
                        }
                    }
                    
                    $chaps = explode('-',$chapters);
                    
                    if(!empty($chaps)){
                       $len3 = count($chaps);
                       
                       if($len3==1){
                           $sCh=(int)$chaps[0];
                           $eCh=(int)$chaps[0];
                       }
                       else if($len3==2){
                           $sCh=(int)$chaps[0];
                           $eCh=(int)$chaps[1];
                       }
                       else{
                           //couldnt parse
                       }
                    }
                    
                    //build query
                    $isFirst = true;
                    for($i=$sCh; $i<=$eCh; $i++){
                        if($isFirst){
                            $isFirst=false;
                        }
                        else{
                            $exhaustiveBookQuery.=',';
                        }
                        
                        if(!empty($prefix)){
                            $exhaustiveBookQuery.=$prefix;
                            $exhaustiveBookQuery.=" ";
                        }
                        
                        $exhaustiveBookQuery.=$theBook;
                        $exhaustiveBookQuery.=' ';
                        $exhaustiveBookQuery.=$i;
                        
                        if(!empty($verses)){
                            $exhaustiveBookQuery.=":";
                            $exhaustiveBookQuery.=$verses;
                        }
                    }
                }
			}
			else{
				$exhaustiveBookQuery=$queryClean;
			}
            
            
            
			$queryClean=urlencode($exhaustiveBookQuery);
		}

		return $queryClean;
    }
}

//------------------------------------
// BiblePassageObject CLASS
//------------------------------------ 
class BiblePassageObject {
	protected $_display;
	protected $_version;
	protected $_textStr;
	protected $_copyright;
	protected $_fums;

	//------------------------------------
    // CONSTRUCTOR
    //------------------------------------ 
    
	public function __construct() 
    { 
         $this->_display = ""; 
         $this->_version = "";
         $this->_textStr = "";
         $this->_copyright="";
         $this->_fums="";
    } 

    public function get_display(){
		return $this->_display;
	}

	public function set_display($_display){
		$this->_display = $_display;
	}

	public function get_version(){
		return $this->_version;
	}

	public function set_version($_version){
		$this->_version = $_version;
	}

	public function get_textStr(){
		return $this->_textStr;
	}

	public function set_textStr($_text){
		$this->_textStr = $_text;
	}

	public function get_copyright(){
		return $this->_copyright;
	}

	public function set_copyright($_copyright){
		$this->_copyright = $_copyright;
	}

	public function get_fums(){
		return $this->_fums;
	}

	public function set_fums($_fums){
		$this->_fums = $_fums;
	}
}


//------------------------------------
// CurlHelper CLASS
//------------------------------------ 
class CurlHelper {

	protected $_token = "";
	protected $_url = "";
	//can use url encoded parameter string
	protected $_queryParams = "";
	protected $_cookieOptions = "";
	
	protected $_result = "";
	protected $_status = "";
	
	protected $_executed = false;
	protected $_isPost = false;
	
    //------------------------------------
    // CONSTRUCTOR
    //------------------------------------ 
    
	public function __construct($url, $qParams, $cookieOptions, $isPost, $token) 
    { 
         $this->_url = $url; 
         $this->_queryParams = $qParams;
         $this->_cookieOptions = $cookieOptions;
         
         //init these
         $this->_result = "";
         $this->_status = "";
         
         $this->_executed = false;
         $this->_isPost = $isPost;
         $this->_token = $token;
    } 
    
    //------------------------------------
        
    public function getResponse()
    {
    	if($this->_executed)
    	{
    		return $this->_result;
    	}
    	else
    	{
    		throw new Exception('curl never executed');
    	}
    }
    
    //------------------------------------
    
    public function getHttpStatus()
    {
    	if($this->_executed)
    	{
    		return $this->_status;
    	}
    	else
    	{
    		throw new Exception('curl never executed');
    	}
    }
    
    //------------------------------------
    
    public function execute() 
    { 
        if(!empty($this->_url))
        {
        	$s = curl_init(); 
			
			$aggUrl = $this->_url;

			//setup some default timeouts
			//time the connection should be open
			curl_setopt($s,CURLOPT_CONNECTTIMEOUT,3);
			//max time to execute
			curl_setopt($s,CURLOPT_TIMEOUT,5);
			curl_setopt($s, CURLOPT_RETURNTRANSFER, 1);
            //curl_setopt($s, CURLOPT_SSLVERSION, 3);
            curl_setopt($s, CURLOPT_SSL_VERIFYPEER, false);
			//curl_setopt($s,CURLOPT_VERBOSE, true);

			if(!empty($this->_token)){
				curl_setopt($s, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
				curl_setopt($s, CURLOPT_USERPWD, $this->_token.":X");
			}
			
			//include posts
			if(!empty($this->_queryParams))
			{
				if($this->_isPost)
				{
					curl_setopt($s,CURLOPT_POST,true); 
            		curl_setopt($s,CURLOPT_POSTFIELDS,$this->_queryParams);
				}
				else
				{
					$aggUrl = $aggUrl."?".$this->_queryParams;
				}
			}
			
			curl_setopt($s,CURLOPT_URL, $aggUrl);
			
			//include some header options
			if(!empty($this->_cookieOptions))
			{
				 curl_setopt($s,CURLOPT_COOKIE, $this->_cookieOptions);
			}
			
			 ob_start(); 
			 $this->_result = curl_exec($s);
			 $this->_status = curl_getinfo($s,CURLINFO_HTTP_CODE); 
			 ob_end_clean();
			  
			 curl_close($s); 
        }
        
        //set this to be true when its been attempted to execute
        $this->_executed = true;
    }
    
    public static function checkHttpStatus($status_code)
    {
    	$sc = (int)$status_code;
    	if($sc >= 200 && $sc < 400){
    		//was a success or redirect
    		return constant("STATUS_SUCCESS");
    	}
    	else if($sc >= 400 && $sc < 500)
    	{
    		return constant("STATUS_CLIENT_ERROR");
    	}
    	else if($sc >=500 && $sc <600)
    	{
    		return constant("STATUS_SERVER_ERROR");
    	}

    	//400-500 or anything else - issue
    	return constant("STATUS_UNKNOWN_ERROR");
    }
}
?>